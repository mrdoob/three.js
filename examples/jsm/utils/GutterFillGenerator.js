import { HalfFloatType, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, RGBAFormat, StorageTexture, Vector2 } from 'three/webgpu';
import { Fn, If, float, globalId, ivec2, mix, screenCoordinate, storageTexture, texture, textureStore, uniform, uvec2, vec2, vec4 } from 'three/tsl';

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
 * in a chain of levels: the map is halved down to one texel, averaging the covered texels, then, from the
 * coarsest level to the finest, the uncovered texels of each level are filled from the level below,
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

		// the levels below the map, counted from the coarsest one, the same for every map: a map twice the size
		// only adds a level on top. Each level has its texture and passes, created as the maps need them

		this._levels = [];
		this._passes = [];

		this._map = texture();
		this._mapSize = uniform( new Vector2() );
		this._top = texture();

		this._fill = createFillMaterial( this._map, this._top, this._mapSize );

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

		if ( renderTarget === null ) renderTarget = new RenderTarget( width, height, { type: HalfFloatType, depthBuffer: false } );

		renderTarget.setSize( width, height );
		renderTarget.texture.channel = source.channel;

		this._map.value = source;
		this._mapSize.value.set( width, height );

		// the levels down to one texel, like the mip levels of a texture, sized from the coarsest one

		const levelCount = Math.floor( Math.log2( Math.max( width, height, 2 ) ) );
		const top = levelCount - 1;
		const { _levels: levels, _passes: passes } = this;

		for ( let i = 0; i < levelCount; i ++ ) {

			if ( i === levels.length ) {

				levels.push( createLevel() );

			}

			const level = levels[ i ];
			const levelWidth = Math.max( 1, width >> ( levelCount - i ) );
			const levelHeight = Math.max( 1, height >> ( levelCount - i ) );

			level.size.value.set( levelWidth, levelHeight );
			level.texture.setSize( levelWidth, levelHeight );
			level.dispatchSize[ 0 ] = Math.ceil( levelWidth / WORKGROUP_SIZE );
			level.dispatchSize[ 1 ] = Math.ceil( levelHeight / WORKGROUP_SIZE );

		}

		this._top.value = levels[ top ].texture;

		// push: from the finest level to the coarsest, each level averages the covered texels of the level above, the
		// map for the top one. Pull: from the coarsest level but one to the finest, each level averages them again,
		// which are still the pushed ones, and fills the texels without any from the level below. All passes run in
		// one compute pass, whose dispatches see the writes of the previous ones

		passes.length = 0;

		for ( let i = top; i >= 0; i -- ) {

			passes.push( this._getPass( i, i === top, false ) );

		}

		for ( let i = 1; i <= top; i ++ ) {

			passes.push( this._getPass( i, i === top, true ) );

		}

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.compute( passes );

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

	/**
	 * Returns a pass of a level, creating it on first use. The top level reads the map, the others the level above.
	 *
	 * @private
	 * @param {number} index - The level, counted from the coarsest one.
	 * @param {boolean} top - Whether the level is the top one.
	 * @param {boolean} pull - Whether to return the pull pass, or the push pass.
	 * @return {ComputeNode} The pass.
	 */
	_getPass( index, top, pull ) {

		const levels = this._levels;
		const level = levels[ index ];
		const slot = ( top ? 2 : 0 ) + ( pull ? 1 : 0 );

		if ( level.passes[ slot ] === null ) {

			const texel = top ? readMap( this._map ) : levels[ index + 1 ].read;
			const above = uvec2( top ? this._mapSize : levels[ index + 1 ].size );
			const size = uvec2( level.size );

			level.passes[ slot ] = pull ?
				createPull( texel, levels[ index - 1 ].read, level.target, above, size, uvec2( levels[ index - 1 ].size ), level.dispatchSize ) :
				createPush( texel, level.target, above, size, level.dispatchSize );

		}

		return level.passes[ slot ];

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
 * Returns a function that reads a texel of the map premultiplied by its coverage, an alpha of 1 or 0, like the
 * levels store them.
 *
 * @private
 * @param {TextureNode} map - The map.
 * @return {function(Node<ivec2>): Node<vec4>} The function.
 */
function readMap( map ) {

	return ( coord ) => {

		const value = map.load( coord ).toVar();
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
 * @param {Node<uvec2>} above - The size of the level above.
 * @param {Node<uvec2>} size - The size of the level.
 * @param {Node<uvec2>} coord - The texel.
 * @return {Node<vec4>} The average, premultiplied by its coverage.
 */
function average( texel, above, size, coord ) {

	const sum = vec4( 0 ).toVar();

	// the branch is the same for every texel of a level, so the levels after an even size only pay for the 2x2 texels

	If( above.x.equal( size.x.mul( 2 ) ).and( above.y.equal( size.y.mul( 2 ) ) ), () => {

		const start = ivec2( coord.mul( 2 ) ).toVar();

		sum.addAssign( texel( start ) );
		sum.addAssign( texel( start.add( ivec2( 1, 0 ) ) ) );
		sum.addAssign( texel( start.add( ivec2( 0, 1 ) ) ) );
		sum.addAssign( texel( start.add( ivec2( 1, 1 ) ) ) );

	} ).Else( () => {

		const start = ivec2( coord.mul( above ).div( size ) ).toVar();
		const end = ivec2( coord.add( 1 ).mul( above ).div( size ) ).toVar();

		for ( let y = 0; y < 3; y ++ ) {

			for ( let x = 0; x < 3; x ++ ) {

				const offset = start.add( ivec2( x, y ) );
				const inside = offset.x.lessThan( end.x ).and( offset.y.lessThan( end.y ) );

				if ( x < 2 && y < 2 ) {

					// the first 2x2 texels are always read, and skipped after a size of one

					sum.addAssign( texel( offset.min( end.sub( 1 ) ) ).mul( inside.select( float( 1 ), float( 0 ) ) ) );

				} else {

					// the third texel only spans the last texel of a level after an odd size

					If( inside, () => {

						sum.addAssign( texel( offset ) );

					} );

				}

			}

		}

	} );

	const covered = sum.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) );

	return vec4( sum.rgb.div( sum.a.max( 1e-8 ) ).mul( covered ), covered );

}

/**
 * Creates the compute node that pushes a level: the average of the covered texels of the level above.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {StorageTextureNode} target - The level.
 * @param {Node<uvec2>} above - The size of the level above.
 * @param {Node<uvec2>} size - The size of the level.
 * @param {Array<number>} dispatchSize - The dispatch size, set for each map.
 * @return {ComputeNode} The compute node.
 */
function createPush( texel, target, above, size, dispatchSize ) {

	return Fn( () => {

		const coord = uvec2( globalId.xy ).toVar();

		// skip the threads of the last workgroups past the edge of the level

		If( coord.x.lessThan( size.x ).and( coord.y.lessThan( size.y ) ), () => {

			textureStore( target, coord, average( texel, above, size, coord ) );

		} );

	} )().compute( dispatchSize, [ WORKGROUP_SIZE, WORKGROUP_SIZE, 1 ] ).setName( 'GutterFill.push' );

}

/**
 * Creates the compute node that pulls a level: the average of the covered texels of the level above, or where
 * there are none, the filled level below, upsampled with filtering.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {function(Node<ivec2>): Node<vec4>} belowTexel - Reads a texel of the filled level below.
 * @param {StorageTextureNode} target - The level.
 * @param {Node<uvec2>} above - The size of the level above.
 * @param {Node<uvec2>} size - The size of the level.
 * @param {Node<uvec2>} below - The size of the level below.
 * @param {Array<number>} dispatchSize - The dispatch size, set for each map.
 * @return {ComputeNode} The compute node.
 */
function createPull( texel, belowTexel, target, above, size, below, dispatchSize ) {

	return Fn( () => {

		const coord = uvec2( globalId.xy ).toVar();

		// skip the threads of the last workgroups past the edge of the level

		If( coord.x.lessThan( size.x ).and( coord.y.lessThan( size.y ) ), () => {

			const value = average( texel, above, size, coord ).toVar();

			If( value.a.equal( 0 ), () => {

				// the bilinear sample of the level below at the center of the texel

				const position = vec2( coord ).add( 0.5 ).mul( vec2( below ) ).div( vec2( size ) ).sub( 0.5 ).toVar();
				const base = ivec2( position.floor() ).toVar();
				const f = position.fract().toVar();
				const last = ivec2( below ).sub( 1 );
				const tap = ( x, y ) => belowTexel( base.add( ivec2( x, y ) ).clamp( ivec2( 0 ), last ) ).rgb;

				value.assign( vec4( mix( mix( tap( 0, 0 ), tap( 1, 0 ), f.x ), mix( tap( 0, 1 ), tap( 1, 1 ), f.x ), f.y ), 0 ) );

			} );

			textureStore( target, coord, value );

		} );

	} )().compute( dispatchSize, [ WORKGROUP_SIZE, WORKGROUP_SIZE, 1 ] ).setName( 'GutterFill.pull' );

}

/**
 * Creates the material that keeps the covered texels of a map and fills the others from the filled top level,
 * upsampled with filtering.
 *
 * @private
 * @param {TextureNode} map - The map.
 * @param {TextureNode} top - The filled top level.
 * @param {UniformNode<vec2>} mapSize - The size of the map.
 * @return {NodeMaterial} The material.
 */
function createFillMaterial( map, top, mapSize ) {

	const fill = Fn( () => {

		const coord = ivec2( screenCoordinate.xy );
		const result = map.load( coord ).toVar();

		If( result.a.lessThanEqual( 0 ), () => {

			const uv = vec2( coord ).add( 0.5 ).div( mapSize );

			result.assign( vec4( top.sample( uv ).level( 0 ).rgb, 0 ) );

		} );

		return result;

	} );

	const material = new NodeMaterial();
	material.fragmentNode = fill();
	material.name = 'GutterFill.fill';

	return material;

}

export { GutterFillGenerator };
