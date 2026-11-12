import { HalfFloatType, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, RGBAFormat, StorageTexture, Vector2 } from 'three/webgpu';
import { Fn, If, Return, float, globalId, ivec2, mix, screenCoordinate, storageTexture, texture, textureStore, uniform, uvec2, vec2, vec4 } from 'three/tsl';

// the passes run in square workgroups of this many threads per side, one thread per texel
const WORKGROUP_SIZE = 8;

const _quadMesh = /*@__PURE__*/ new QuadMesh();

let _rendererState;

/**
 * Fills the gutters of a baked map: the texels outside the charts of a UV atlas, e.g. of a light map or an
 * ambient occlusion map. Texture filtering reads texels on both sides of the border of a chart, and the mip
 * levels of a map average whole blocks of texels, so empty gutters show up as dark outlines around the
 * charts, the more the farther away the map is seen. This fills every texel outside the charts with the
 * values of the nearest charts.
 *
 * The coverage of the map is read from its alpha: texels with an alpha above zero are covered, e.g. in a
 * light map of {@link LightMapper} or a map stitched by {@link SeamStitchGenerator}. The fill is a push-pull
 * in one chain of levels: the map is halved down to one texel, averaging the covered texels, then, from
 * the coarsest level to the finest, the uncovered texels of each level are filled from the level below,
 * upsampled with filtering. The covered texels keep their values, the filled texels have an alpha of zero.
 *
 * Like {@link PMREMGenerator}, the generator can fill many maps, and the caller owns the results.
 *
 * ```js
 * const gutterFill = new GutterFillGenerator( renderer );
 *
 * const renderTarget = new THREE.RenderTarget( size, size, { type: THREE.HalfFloatType, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter } );
 * gutterFill.generate( lightMapper.texture, renderTarget );
 *
 * material.lightMap = renderTarget.texture;
 * ```
 *
 * This class can only be used with {@link WebGPURenderer} and a WebGPU backend.
 *
 * @three_import import { GutterFillGenerator } from 'three/addons/utils/GutterFillGenerator.js';
 */
class GutterFillGenerator {

	/**
	 * Constructs a new gutter fill generator.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 */
	constructor( renderer ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		// the levels below the map, counted from the coarsest one so that maps of all sizes share them: a map twice
		// the size only adds a level on top. Each level has its texture, and its passes once a map needs them

		this._width = 0;
		this._height = 0;
		this._levels = [];
		this._passes = [];

		this._source = texture();
		this._sourceSize = uniform( new Vector2() );
		this._firstLevel = texture();

		this._fill = createFillMaterial( this._source, this._firstLevel, this._sourceSize );

	}

	/**
	 * Fills the gutters of a map.
	 *
	 * @param {Texture} source - The map, with an alpha above zero at its covered texels.
	 * @param {?RenderTarget} [renderTarget=null] - The render target of the filled map, resized to the map. The map
	 * must not be its texture. By default, a new half float render target.
	 * @return {RenderTarget} The render target of the filled map, with the UV channel of the map.
	 */
	generate( source, renderTarget = null ) {

		const renderer = this.renderer;
		const { width, height } = source.image;

		this._setSize( width, height );

		if ( renderTarget === null ) {

			renderTarget = new RenderTarget( width, height, { type: HalfFloatType, depthBuffer: false } );

		} else {

			renderTarget.setSize( width, height );

		}

		renderTarget.texture.channel = source.channel;

		this._source.value = source;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// push and pull in one compute pass, whose dispatches see the writes of the previous ones, then the
		// filled map

		if ( this._passes.length > 0 ) {

			renderer.compute( this._passes );

		}

		_quadMesh.material = this._fill;
		renderer.setRenderTarget( renderTarget );
		_quadMesh.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

		return renderTarget;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._disposeLevels();

	}

	/**
	 * Sizes the levels and collects the passes of a map size.
	 *
	 * @private
	 * @param {number} width - The width of the map.
	 * @param {number} height - The height of the map.
	 */
	_setSize( width, height ) {

		if ( this._width === width && this._height === height ) {

			return;

		}

		this._width = width;
		this._height = height;

		this._sourceSize.value.set( width, height );

		// level i is half the size of level i + 1, rounded down, like the levels of a texture, down to level 0 of one
		// texel. The textures of the levels are only reallocated when their size changes

		const levels = this._levels;
		const count = Math.floor( Math.log2( Math.max( width, height, 2 ) ) );
		const top = count - 1;

		for ( let i = 0; i < count; i ++ ) {

			if ( i === levels.length ) {

				levels.push( createLevel() );

			}

			const level = levels[ i ];
			const w = Math.max( 1, width >> ( count - i ) );
			const h = Math.max( 1, height >> ( count - i ) );

			level.size.value.set( w, h );
			level.texture.setSize( w, h );
			level.dispatchSize[ 0 ] = Math.ceil( w / WORKGROUP_SIZE );
			level.dispatchSize[ 1 ] = Math.ceil( h / WORKGROUP_SIZE );

		}

		this._firstLevel.value = levels[ top ].texture;

		// push: each level averages the covered texels of the level above. Pull: from the coarsest level to the
		// finest, each level averages them again, which are still the pushed ones, and fills the texels without
		// any from the level below. Each pass reads and writes different levels

		this._passes.length = 0;

		for ( let i = top; i >= 0; i -- ) {

			this._passes.push( this._getPass( i, i === top, false ) );

		}

		for ( let i = 1; i <= top; i ++ ) {

			this._passes.push( this._getPass( i, i === top, true ) );

		}

	}

	/**
	 * Returns a pass of a level, created on first use. The top level reads the map, the others the level above.
	 *
	 * @private
	 * @param {number} index - The level, counted from the coarsest one.
	 * @param {boolean} top - Whether the level is the top one.
	 * @param {boolean} isPull - Whether to return the pull pass, or the push pass.
	 * @return {ComputeNode} The pass.
	 */
	_getPass( index, top, isPull ) {

		const levels = this._levels;
		const level = levels[ index ];
		const slot = ( top ? 2 : 0 ) + ( isPull ? 1 : 0 );

		if ( level.passes[ slot ] === null ) {

			const texel = top ? readSource( this._source ) : levels[ index + 1 ].read;
			const above = uvec2( top ? this._sourceSize : levels[ index + 1 ].size );
			const size = uvec2( level.size );

			level.passes[ slot ] = isPull ?
				pull( texel, above, size, levels[ index - 1 ].read, uvec2( levels[ index - 1 ].size ), level.target, level.dispatchSize ) :
				push( texel, above, size, level.target, level.dispatchSize );

		}

		return level.passes[ slot ];

	}

	/**
	 * Frees the levels and the passes.
	 *
	 * @private
	 */
	_disposeLevels() {

		this._fill.dispose();

		for ( const level of this._levels ) {

			level.texture.dispose();

			for ( const pass of level.passes ) {

				if ( pass !== null ) {

					pass.dispose();

				}

			}

		}

	}

}

/**
 * Creates a level: its texture, its size, the nodes that read and write it, and its passes, created on first
 * use: push and pull reading the level above, then push and pull reading the map.
 *
 * @private
 * @return {Object} The level.
 */
function createLevel() {

	const levelTexture = new StorageTexture( 1, 1 );
	levelTexture.type = HalfFloatType;
	levelTexture.format = RGBAFormat;
	levelTexture.generateMipmaps = false;

	const read = storageTexture( levelTexture ).setAccess( 'readOnly' );

	return {
		texture: levelTexture,
		size: uniform( new Vector2() ),
		target: storageTexture( levelTexture ),
		read: ( coord ) => read.load( coord ),
		dispatchSize: [ 1, 1, 1 ],
		passes: [ null, null, null, null ],
	};

}

/**
 * Returns a function that reads the texels of the map with their coverage, an alpha of 1 or 0, like the levels
 * store them.
 *
 * @private
 * @param {TextureNode} source - The map.
 * @return {function(Node<ivec2>): Node<vec4>} The function.
 */
function readSource( source ) {

	return ( coord ) => {

		const value = source.load( coord ).toVar();
		const covered = value.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) );

		return vec4( value.rgb.mul( covered ), covered );

	};

}

/**
 * Returns a node for the average of the covered texels of the level above that a texel spans, 2x2 or, after an
 * odd size, up to 3x3, with whether any of them is covered in alpha.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Node<uvec2>} above - The width and height of the level above.
 * @param {Node<uvec2>} size - The width and height of the level.
 * @param {Node<uvec2>} coord - The texel.
 * @return {Node<vec4>} The average, premultiplied by its coverage.
 */
function average( texel, above, size, coord ) {

	const start = ivec2( coord.mul( above ).div( size ) ).toVar();
	const end = ivec2( coord.add( 1 ).mul( above ).div( size ) ).toVar();
	const sum = vec4( 0 ).toVar();

	sum.addAssign( texel( start ) );
	sum.addAssign( texel( start.add( ivec2( 1, 0 ) ) ) );
	sum.addAssign( texel( start.add( ivec2( 0, 1 ) ) ) );
	sum.addAssign( texel( start.add( ivec2( 1, 1 ) ) ) );

	// the third texel only spans the last texel of a level after an odd size. The branch is the same for every texel
	// of a level, so the levels after an even size skip it

	If( above.x.notEqual( size.x.mul( 2 ) ).or( above.y.notEqual( size.y.mul( 2 ) ) ), () => {

		for ( let y = 0; y < 3; y ++ ) {

			for ( let x = 0; x < 3; x ++ ) {

				if ( x < 2 && y < 2 ) {

					continue;

				}

				If( start.x.add( x ).lessThan( end.x ).and( start.y.add( y ).lessThan( end.y ) ), () => {

					sum.addAssign( texel( start.add( ivec2( x, y ) ) ) );

				} );

			}

		}

	} );

	const covered = sum.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) );

	return vec4( sum.rgb.div( sum.a.max( 1e-8 ) ).mul( covered ), covered );

}

/**
 * Returns the compute node that pushes a level: the average of the covered texels of the level above.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Node<uvec2>} above - The width and height of the level above.
 * @param {Node<uvec2>} size - The width and height of the level.
 * @param {StorageTextureNode} target - The level.
 * @param {Array<number>} dispatchSize - The dispatch size, set for each map size.
 * @return {ComputeNode} The compute node.
 */
function push( texel, above, size, target, dispatchSize ) {

	return Fn( () => {

		const coord = uvec2( globalId.xy ).toVar();

		// skip the threads of the last workgroups past the edge of the level

		If( coord.x.greaterThanEqual( size.x ).or( coord.y.greaterThanEqual( size.y ) ), () => {

			Return();

		} );

		textureStore( target, coord, average( texel, above, size, coord ) );

	} )().compute( dispatchSize, [ WORKGROUP_SIZE, WORKGROUP_SIZE, 1 ] ).setName( 'GutterFill.push' );

}

/**
 * Returns the compute node that pulls a level: the average of the covered texels of the level above, or where
 * there are none, the filled level below, upsampled with filtering.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Node<uvec2>} above - The width and height of the level above.
 * @param {Node<uvec2>} size - The width and height of the level.
 * @param {function(Node<ivec2>): Node<vec4>} belowTexel - Reads a texel of the filled level below.
 * @param {Node<uvec2>} below - The width and height of the level below.
 * @param {StorageTextureNode} target - The level.
 * @param {Array<number>} dispatchSize - The dispatch size, set for each map size.
 * @return {ComputeNode} The compute node.
 */
function pull( texel, above, size, belowTexel, below, target, dispatchSize ) {

	return Fn( () => {

		const coord = uvec2( globalId.xy ).toVar();

		// skip the threads of the last workgroups past the edge of the level

		If( coord.x.greaterThanEqual( size.x ).or( coord.y.greaterThanEqual( size.y ) ), () => {

			Return();

		} );

		const value = average( texel, above, size, coord ).toVar();

		If( value.a.equal( 0 ), () => {

			// the bilinear sample of the level below at the center of the texel

			const position = vec2( coord ).add( 0.5 ).mul( vec2( below ).div( vec2( size ) ) ).sub( 0.5 ).toVar();
			const base = ivec2( position.floor() ).toVar();
			const f = position.fract().toVar();
			const tap = ( x, y ) => belowTexel( base.add( ivec2( x, y ) ).clamp( ivec2( 0 ), ivec2( below ).sub( 1 ) ) ).rgb;

			value.assign( vec4( mix( mix( tap( 0, 0 ), tap( 1, 0 ), f.x ), mix( tap( 0, 1 ), tap( 1, 1 ), f.x ), f.y ), 0 ) );

		} );

		textureStore( target, coord, value );

	} )().compute( dispatchSize, [ WORKGROUP_SIZE, WORKGROUP_SIZE, 1 ] ).setName( 'GutterFill.pull' );

}

/**
 * Creates the material that keeps the covered texels of a map and fills the others from the filled first level,
 * upsampled with filtering.
 *
 * @private
 * @param {TextureNode} source - The map.
 * @param {?TextureNode} levels - The filled first level.
 * @param {Node<vec2>} size - The width and height of the map.
 * @return {NodeMaterial} The material.
 */
function createFillMaterial( source, levels, size ) {

	const fill = Fn( () => {

		const coord = ivec2( screenCoordinate.xy );
		const result = source.load( coord ).toVar();

		if ( levels !== null ) {

			If( result.a.lessThanEqual( 0 ), () => {

				const uv = vec2( coord ).add( 0.5 ).div( size );

				result.assign( vec4( levels.sample( uv ).level( 0 ).rgb, 0 ) );

			} );

		}

		return result;

	} );

	const material = new NodeMaterial();
	material.fragmentNode = fill();
	material.name = 'GutterFill.fill';

	return material;

}

export { GutterFillGenerator };
