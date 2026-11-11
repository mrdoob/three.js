import { HalfFloatType, LinearFilter, NodeMaterial, QuadMesh, RendererUtils, RenderTarget, RGBAFormat, StorageTexture, StorageTextureNode } from 'three/webgpu';
import { Fn, If, float, instanceIndex, ivec2, mix, screenCoordinate, texture, textureStore, uvec2, vec2, vec4 } from 'three/tsl';

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
 * in one chain of mip levels: the map is halved down to one texel, averaging the covered texels, then, from
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

		// the levels below the map, as the mip levels of one texture that is reused for maps of the same
		// size: mip level i is half the size of the level above, the map for mip level 0

		this._width = 0;
		this._height = 0;
		this._levels = null;
		this._passes = [];
		this._fill = null;

		this._source = texture();

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

		if ( renderTarget === null ) renderTarget = new RenderTarget( width, height, { type: HalfFloatType, depthBuffer: false } );
		else if ( renderTarget.width !== width || renderTarget.height !== height ) renderTarget.setSize( width, height );

		renderTarget.texture.channel = source.channel;

		this._source.value = source;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		// push and pull in one compute pass, whose dispatches see the writes of the previous ones, then the
		// filled map

		if ( this._passes.length > 0 ) renderer.compute( this._passes );

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
	 * Creates the levels and the passes of a map size.
	 *
	 * @private
	 * @param {number} width - The width of the map.
	 * @param {number} height - The height of the map.
	 */
	_setSize( width, height ) {

		if ( this._width === width && this._height === height ) return;

		this._disposeLevels();

		this._width = width;
		this._height = height;

		const source = this._source;
		const sizes = [];

		// mip level i is half the size of level i - 1, rounded down, like the levels of a texture

		let w = width, h = height;

		while ( w > 1 || h > 1 ) {

			w = Math.max( 1, Math.floor( w / 2 ) );
			h = Math.max( 1, Math.floor( h / 2 ) );
			sizes.push( [ w, h ] );

		}

		if ( sizes.length > 0 ) {

			const levels = new StorageTexture( sizes[ 0 ][ 0 ], sizes[ 0 ][ 1 ] );
			levels.type = HalfFloatType;
			levels.format = RGBAFormat;
			levels.generateMipmaps = true;
			levels.mipmapsAutoUpdate = false;
			levels.minFilter = LinearFilter;
			levels.magFilter = LinearFilter;

			this._levels = levels;

			// the texels of a level with their coverage, the map's with an alpha of 1 or 0

			const read = ( level ) => {

				if ( level === - 1 ) return ( coord ) => {

					const value = source.load( coord ).toVar();
					const covered = value.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) );

					return vec4( value.rgb.mul( covered ), covered );

				};

				const node = new MipStorageTextureNode( levels, 'readOnly', level );

				return ( coord ) => node.load( coord );

			};

			const size = ( level ) => level === - 1 ? [ width, height ] : sizes[ level ];
			const write = ( level ) => new MipStorageTextureNode( levels, 'writeOnly', level );

			// push: each level averages the covered texels of the level above. Pull: from the coarsest level to the
			// finest, each level averages them again, which are still the pushed ones, and fills the texels without
			// any from the level below. Each pass reads and writes different mip levels

			for ( let i = 0; i < sizes.length; i ++ ) {

				this._passes.push( push( read( i - 1 ), size( i - 1 ), sizes[ i ], write( i ) ) );

			}

			for ( let i = sizes.length - 2; i >= 0; i -- ) {

				this._passes.push( pull( read( i - 1 ), size( i - 1 ), sizes[ i ], read( i + 1 ), sizes[ i + 1 ], write( i ) ) );

			}

		}

		this._fill = createFillMaterial( source, this._levels !== null ? texture( this._levels ) : null, width, height );

	}

	/**
	 * Frees the levels and the passes.
	 *
	 * @private
	 */
	_disposeLevels() {

		if ( this._levels !== null ) this._levels.dispose();
		if ( this._fill !== null ) this._fill.dispose();

		for ( const node of this._passes ) node.dispose();

		this._levels = null;
		this._fill = null;
		this._passes = [];
		this._width = 0;
		this._height = 0;

	}

}

/**
 * Storage texture node bound to a single mip level, so that a pass can read one level and write another. Texture
 * nodes normally share one binding per texture, this node keys its binding by its access and mip level.
 *
 * @private
 */
class MipStorageTextureNode extends StorageTextureNode {

	constructor( value, access, mipLevel ) {

		super( value, null, null );

		this.setAccess( access );
		this.setMipLevel( mipLevel );

	}

	getUniformHash() {

		return `${ this.value.uuid }:${ this.access }:${ this.mipLevel }`;

	}

}

/**
 * Returns a node for the average of the covered texels of the level above that a texel spans, 2x2 or, after an
 * odd size, up to 3x3, with whether any of them is covered in alpha.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Array<number>} above - The width and height of the level above.
 * @param {Array<number>} size - The width and height of the level.
 * @param {Node<uvec2>} coord - The texel.
 * @return {Node<vec4>} The average, premultiplied by its coverage.
 */
function average( texel, above, size, coord ) {

	const [ width, height ] = size;
	const spanX = above[ 0 ] === width * 2 ? 2 : 3;
	const spanY = above[ 1 ] === height * 2 ? 2 : 3;

	const start = ivec2( coord.mul( uvec2( above[ 0 ], above[ 1 ] ) ).div( uvec2( width, height ) ) ).toVar();
	const end = ivec2( coord.add( 1 ).mul( uvec2( above[ 0 ], above[ 1 ] ) ).div( uvec2( width, height ) ) ).toVar();
	const sum = vec4( 0 ).toVar();

	for ( let y = 0; y < spanY; y ++ ) {

		for ( let x = 0; x < spanX; x ++ ) {

			const add = () => sum.addAssign( texel( start.add( ivec2( x, y ) ) ) );

			// the third texel only spans the last texel of a level after an odd size

			if ( x < 2 && y < 2 ) add();
			else If( start.x.add( x ).lessThan( end.x ).and( start.y.add( y ).lessThan( end.y ) ), add );

		}

	}

	const covered = sum.a.greaterThan( 0 ).select( float( 1 ), float( 0 ) );

	return vec4( sum.rgb.div( sum.a.max( 1e-8 ) ).mul( covered ), covered );

}

/**
 * Returns the compute node that pushes a level: the average of the covered texels of the level above.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Array<number>} above - The width and height of the level above.
 * @param {Array<number>} size - The width and height of the level.
 * @param {StorageTextureNode} target - The level.
 * @return {ComputeNode} The compute node.
 */
function push( texel, above, size, target ) {

	const [ width, height ] = size;

	return Fn( () => {

		const coord = uvec2( instanceIndex.mod( width ), instanceIndex.div( width ) ).toVar();

		textureStore( target, coord, average( texel, above, size, coord ) );

	} )().compute( width * height ).setName( 'GutterFill.push' );

}

/**
 * Returns the compute node that pulls a level: the average of the covered texels of the level above, or where
 * there are none, the filled level below, upsampled with filtering.
 *
 * @private
 * @param {function(Node<ivec2>): Node<vec4>} texel - Reads a texel of the level above, premultiplied by its coverage.
 * @param {Array<number>} above - The width and height of the level above.
 * @param {Array<number>} size - The width and height of the level.
 * @param {function(Node<ivec2>): Node<vec4>} belowTexel - Reads a texel of the filled level below.
 * @param {Array<number>} below - The width and height of the level below.
 * @param {StorageTextureNode} target - The level.
 * @return {ComputeNode} The compute node.
 */
function pull( texel, above, size, belowTexel, below, target ) {

	const [ width, height ] = size;

	return Fn( () => {

		const coord = uvec2( instanceIndex.mod( width ), instanceIndex.div( width ) ).toVar();
		const value = average( texel, above, size, coord ).toVar();

		If( value.a.equal( 0 ), () => {

			// the bilinear sample of the level below at the center of the texel

			const position = vec2( coord ).add( 0.5 ).mul( vec2( below[ 0 ] / width, below[ 1 ] / height ) ).sub( 0.5 ).toVar();
			const base = ivec2( position.floor() ).toVar();
			const f = position.fract().toVar();
			const tap = ( x, y ) => belowTexel( base.add( ivec2( x, y ) ).clamp( ivec2( 0 ), ivec2( below[ 0 ] - 1, below[ 1 ] - 1 ) ) ).rgb;

			value.assign( vec4( mix( mix( tap( 0, 0 ), tap( 1, 0 ), f.x ), mix( tap( 0, 1 ), tap( 1, 1 ), f.x ), f.y ), 0 ) );

		} );

		textureStore( target, coord, value );

	} )().compute( width * height ).setName( 'GutterFill.pull' );

}

/**
 * Creates the material that keeps the covered texels of a map and fills the others from the filled first level,
 * upsampled with filtering.
 *
 * @private
 * @param {TextureNode} source - The map.
 * @param {?TextureNode} levels - The filled levels.
 * @param {number} width - The width of the map.
 * @param {number} height - The height of the map.
 * @return {NodeMaterial} The material.
 */
function createFillMaterial( source, levels, width, height ) {

	const fill = Fn( () => {

		const coord = ivec2( screenCoordinate.xy );
		const result = source.load( coord ).toVar();

		if ( levels !== null ) {

			If( result.a.lessThanEqual( 0 ), () => {

				const uv = vec2( coord ).add( 0.5 ).div( vec2( width, height ) );

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
