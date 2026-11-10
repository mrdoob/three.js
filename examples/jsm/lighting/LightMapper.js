import { BackSide, BufferAttribute, BufferGeometry, CustomBlending, DoubleSide, FloatType, HalfFloatType, Mesh, MeshLambertNodeMaterial, NearestFilter, NoBlending, NodeMaterial, OneFactor, OrthographicCamera, QuadMesh, RedFormat, RGFormat, RendererUtils, RenderTarget, Scene, Vector2, warnOnce } from 'three/webgpu';
import { Fn, If, Loop, attribute, ivec2, lights, luminance, modelViewMatrix, mrt, normalViewGeometry, normalWorldGeometry, output, positionLocal, positionWorld, round, screenCoordinate, texture, textureLoad, uniform, uv, vec2, vec4 } from 'three/tsl';

// half float sums keep their rounding error small up to this many samples, and their weights are scaled
// down so a sum of this many samples of an irradiance of up to about 4000 stays below the largest half float

const HALF_FLOAT_SAMPLES = 1024;
const HALF_FLOAT_WEIGHT = 1 / 64;

let _rendererState;

/**
 * Bakes indirect diffuse irradiance into a light map. The irradiance is defined by a
 * function that returns a TSL node for a world-space position and normal, e.g. a prepared
 * {@link RayTracedRadiosity} via `rayTracedRadiosityIrradiance()`.
 *
 * Meshes need light map UVs in the `uv1` attribute, e.g. generated with {@link unwrapUVs}.
 * Each sample rasterizes the meshes in UV space with a sub-texel jitter and accumulates
 * the result. The function also receives the sample index, so stochastic sources can
 * vary their samples and converge as they accumulate. Call `update()` once per frame
 * to bake progressively, or pass a sample count to bake at once.
 * Samples accumulate in float precision with the 'float32-blendable' renderer feature. Without it,
 * they accumulate in half float precision with jittered weights, up to 1024 samples; further
 * samples are ignored.
 * Keep the source geometry and GI data static while accumulating. Call `reset()`
 * after changing transforms or lighting. Atlas charts need at least three texels
 * of padding; the resolve fills two texels around covered surfaces.
 * Irradiance uses linear BT.709/sRGB primaries in lux.
 * Do not include material ambient occlusion, base color, or exposure in the source
 * irradiance. Material occlusion is applied once at runtime. Keep any contributions
 * included in the bake out of runtime diffuse lighting to avoid counting them twice.
 * The `variance` and `guides` options also bake the inputs of a denoiser like
 * {@link DenoiseNode}: the noise of each texel and the surface that it lies on,
 * see {@link LightMapper#getTextureNode}.
 *
 * ```js
 * const radiosity = new RayTracedRadiosity();
 * radiosity.update( renderer, scene );
 *
 * const lightMapper = new LightMapper( renderer, size, rayTracedRadiosityIrradiance( radiosity ) );
 * lightMapper.addObjects( meshes );
 * lightMapper.update( 64 );
 *
 * material.lightMap = lightMapper.texture;
 * ```
 *
 * This class can only be used with {@link WebGPURenderer}.
 *
 * @three_import import { LightMapper } from 'three/addons/lighting/LightMapper.js';
 */
class LightMapper {

	/**
	 * Constructs a new light mapper.
	 *
	 * @param {WebGPURenderer} renderer - The renderer.
	 * @param {number} size - The light map size in texels.
	 * @param {function(Node<vec3>, Node<vec3>, Node<float>): Node<vec3>} irradianceNode - Returns the irradiance for a world-space position, normal and sample index.
	 * @param {Object} [options] - Bake options.
	 * @param {Array<Light>} [options.lights=[]] - Direct lights to include in the diffuse bake. Render their shadows in the source scene first and disable shadow updates during the UV bake.
	 * @param {boolean} [options.variance=false] - Whether to also estimate the noise of each texel into {@link LightMapper#varianceTexture}. Requires the 'float32-blendable' renderer feature.
	 * @param {boolean} [options.guides=false] - Whether to also rasterize the surface of each texel into {@link LightMapper#positionTexture} and {@link LightMapper#normalTexture}.
	 */
	constructor( renderer, size, irradianceNode, { lights = [], variance = false, guides = false } = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The source of indirect irradiance.
		 *
		 * @type {function(Node<vec3>, Node<vec3>, Node<float>): Node<vec3>}
		 */
		this.irradianceNode = irradianceNode;

		/**
		 * The light map size in texels.
		 *
		 * @type {number}
		 */
		this.size = size;

		/**
		 * The number of accumulated samples.
		 *
		 * @type {number}
		 * @readonly
		 * @default 0
		 */
		this.samples = 0;

		// the samples accumulate as sums, with their count in alpha. Half floats round each sample added to a
		// large sum by up to an eighth of its value at 256 samples, in the same direction for similar samples,
		// which shows as bands, so the sums are floats where the renderer can blend them. Half float sums
		// weigh the samples unevenly instead, see _sampleWeight()

		const floatSums = renderer.hasFeature( 'float32-blendable' );

		// for the variance, the luminances of the samples and their squares accumulate in a second target of
		// float sums: half floats would overflow, and the variance of a mean from half floats would be lost
		// in their rounding

		const accumulateMoments = variance && floatSums;

		this._accumulation = new RenderTarget( size, size, { type: floatSums ? FloatType : HalfFloatType, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false, count: accumulateMoments ? 2 : 1 } );

		this._renderTarget = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false, count: accumulateMoments ? 2 : 1 } );
		this._renderTarget.texture.channel = 1;

		if ( accumulateMoments ) {

			this._accumulation.textures[ 0 ].name = 'output';
			this._accumulation.textures[ 1 ].name = 'moment';
			this._accumulation.textures[ 1 ].type = FloatType;
			this._accumulation.textures[ 1 ].format = RGFormat;

			this._renderTarget.textures[ 0 ].name = 'output';
			this._renderTarget.textures[ 1 ].name = 'variance';
			this._renderTarget.textures[ 1 ].type = FloatType;
			this._renderTarget.textures[ 1 ].format = RedFormat;

		}

		/**
		 * The baked light map. It stores linear diffuse irradiance in lux, without baked
		 * albedo, material ambient occlusion, or display exposure, and uses `uv1`.
		 * Values are not divided by pi, matching the runtime light map input.
		 *
		 * @type {Texture}
		 */
		this.texture = this._renderTarget.texture;

		/**
		 * The variance of the luminance of each texel of the light map, the variance of the mean of its
		 * samples, in the red channel. Texels without samples are -1. Only with the `variance` option and
		 * the 'float32-blendable' renderer feature, else `null`.
		 *
		 * @type {?Texture}
		 * @readonly
		 */
		this.varianceTexture = accumulateMoments ? this._renderTarget.textures[ 1 ] : null;

		// the world-space position with the chart index + 1 in alpha (0 without surface), and the normal

		this._guides = guides ? new RenderTarget( size, size, { type: FloatType, minFilter: NearestFilter, magFilter: NearestFilter, depthBuffer: false, count: 2 } ) : null;

		if ( guides ) {

			this._guides.textures[ 0 ].name = 'position';
			this._guides.textures[ 1 ].name = 'normal';
			this._guides.textures[ 1 ].type = HalfFloatType;

		}

		/**
		 * The world-space position of the surface of each texel, with the index of its chart + 1 in alpha,
		 * or 0 in alpha for texels without a surface. A chart is a set of triangles that are connected in
		 * the light map. Only with the `guides` option, else `null`.
		 *
		 * @type {?Texture}
		 * @readonly
		 */
		this.positionTexture = guides ? this._guides.textures[ 0 ] : null;

		/**
		 * The world-space normal of the surface of each texel. Only with the `guides` option, else `null`.
		 *
		 * @type {?Texture}
		 * @readonly
		 */
		this.normalTexture = guides ? this._guides.textures[ 1 ] : null;

		// all textures are in the space of the light map

		for ( const map of [ this.varianceTexture, this.positionTexture, this.normalTexture ] ) if ( map !== null ) map.channel = 1;

		this._textureNodes = {};

		this._scene = new Scene();
		this._guideScene = new Scene();
		this._camera = new OrthographicCamera();
		this._objects = [];
		this._jitter = uniform( new Vector2() );
		this._sample = uniform( 0 );
		this._weight = uniform( 1 );
		this._floatSums = floatSums;
		this._charts = 0;
		this._guidesNeedUpdate = false;

		this._frontMaterial = this._createBakeMaterial( irradianceNode, false, lights );
		this._backMaterial = this._createBakeMaterial( irradianceNode, true, lights );
		this._guideMaterials = guides ? [ this._createGuideMaterial( false ), this._createGuideMaterial( true ) ] : null;

		// normalize the accumulated samples and fill the chart padding

		const accumulation = this._accumulation.texture;
		const moments = accumulateMoments ? this._accumulation.textures[ 1 ] : null;
		const maxCoord = ivec2( size - 1 );

		const resolve = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = textureLoad( accumulation, coord ).toVar();
			const sum = vec4( 0 ).toVar();

			If( center.a.equal( 0 ), () => {

				Loop( { start: - 2, end: 2, condition: '<=', name: 'x' }, { start: - 2, end: 2, condition: '<=', name: 'y' }, ( { x, y } ) => {

					const value = textureLoad( accumulation, coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxCoord ) );

					If( value.a.greaterThan( 0 ), () => {

						sum.addAssign( vec4( value.rgb.div( value.a ), 1 ) );

					} );

				} );

				center.assign( sum );

			} );

			return vec4( center.rgb.div( center.a.max( 1e-4 ) ), 1 );

		} );

		// the variance of the samples over their count is the variance of their mean

		const estimateVariance = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const count = textureLoad( accumulation, coord ).a;
			const moment = textureLoad( moments, coord ).rg.div( count.max( 1 ) );
			const variance = moment.y.sub( moment.x.pow2() ).max( 0 ).div( count.sub( 1 ).max( 1 ) );

			return count.greaterThan( 0 ).select( variance, - 1 );

		} );

		const resolveMaterial = new NodeMaterial();
		resolveMaterial.fragmentNode = moments !== null ? mrt( { output: resolve(), variance: estimateVariance() } ) : resolve();

		this._quad = new QuadMesh( resolveMaterial );

	}

	/**
	 * Returns a texture of the light mapper: `'color'`, the light map, or the inputs of a denoiser like
	 * {@link DenoiseNode}: `'variance'` with the `variance` option, `'position'` and `'normal'` with
	 * the `guides` option.
	 *
	 * @param {('color'|'variance'|'position'|'normal')} [name='color'] - The name of the texture.
	 * @return {Texture} The texture.
	 */
	getTexture( name = 'color' ) {

		const map = { color: this.texture, variance: this.varianceTexture, position: this.positionTexture, normal: this.normalTexture }[ name ];

		if ( map === undefined ) throw new Error( `THREE.LightMapper: Unknown texture "${ name }".` );
		if ( map === null ) throw new Error( `THREE.LightMapper: The "${ name }" texture needs the ${ name === 'variance' ? 'variance' : 'guides' } option.` );

		return map;

	}

	/**
	 * Returns a texture of the light mapper as a texture node, see {@link LightMapper#getTexture}. The
	 * nodes sample the light map UVs, e.g. `material.lightMapNode = lightMapper.getTextureNode()`.
	 *
	 * @param {('color'|'variance'|'position'|'normal')} [name='color'] - The name of the texture.
	 * @return {TextureNode} The texture node.
	 */
	getTextureNode( name = 'color' ) {

		let node = this._textureNodes[ name ];

		if ( node === undefined ) {

			node = texture( this.getTexture( name ) );
			this._textureNodes[ name ] = node;

		}

		return node;

	}

	/**
	 * Adds meshes to the light map. Their geometries must provide `uv1`.
	 * Skinned and instanced meshes are not supported.
	 *
	 * @param {Array<Mesh>} objects - The meshes to add.
	 */
	addObjects( objects ) {

		for ( const object of objects ) {

			const bakeMaterial = material => material.side === BackSide ? this._backMaterial : this._frontMaterial;
			const material = Array.isArray( object.material ) ? object.material.map( bakeMaterial ) : bakeMaterial( object.material );

			const proxy = new Mesh( object.geometry, material );
			proxy.matrixAutoUpdate = false;
			proxy.frustumCulled = false;
			proxy.receiveShadow = object.receiveShadow;

			this._scene.add( proxy );
			this._objects.push( object );

			if ( this._guides !== null ) this._addGuide( object );

		}

	}

	/**
	 * Accumulates samples into the light map.
	 *
	 * @param {number} [samples=1] - The number of samples to add.
	 */
	update( samples = 1 ) {

		const renderer = this.renderer;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.autoClear = false;
		renderer.setClearColor( 0x000000, 0 );

		for ( let i = 0; i < this._objects.length; i ++ ) {

			this._objects[ i ].updateWorldMatrix( true, false );
			this._scene.children[ i ].matrix.copy( this._objects[ i ].matrixWorld );
			if ( this._guides !== null ) this._guideScene.children[ i ].matrix.copy( this._objects[ i ].matrixWorld );

		}

		// the guides follow the jitters of the samples, all of them after a reset or new objects

		const firstGuide = this._guidesNeedUpdate ? 0 : this.samples;

		renderer.setRenderTarget( this._accumulation );

		if ( this.samples === 0 ) renderer.clear();

		for ( let i = 0; i < samples; i ++ ) {

			if ( this._floatSums === false && this.samples >= HALF_FLOAT_SAMPLES ) {

				warnOnce( `LightMapper: Half float sums are limited to ${ HALF_FLOAT_SAMPLES } samples, further samples are ignored. Use a renderer with the 'float32-blendable' feature for more.` );
				break;

			}

			this._sample.value = this.samples;
			this._weight.value = this._sampleWeight( this.samples );
			this._jitter.value.set( halton( this.samples + 1, 2 ) - 0.5, halton( this.samples + 1, 3 ) - 0.5 ).multiplyScalar( 2 / this.size );

			renderer.render( this._scene, this._camera );
			this.samples ++;

		}

		if ( this._guides !== null ) this._renderGuides( firstGuide, this.samples );

		renderer.setRenderTarget( this._renderTarget );
		this._quad.render( renderer );

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Returns the weight of a sample. Similar samples added to a half float sum round in the same
	 * direction, so their weights are spread over the rounding step of the sum, which grows with it,
	 * and the samples round up and down evenly. The weights are also scaled down, so the sums of
	 * bright texels stay below the largest half float, 65504, since the resolve divides by the sum
	 * of the weights. Float sums weigh all samples the same.
	 *
	 * @private
	 * @param {number} index - The index of the sample.
	 * @return {number} The weight.
	 */
	_sampleWeight( index ) {

		if ( this._floatSums ) return 1;

		return ( 1 + ( 2 * halton( index + 1, 5 ) - 1 ) * Math.min( index / 2048, 1 ) ) * HALF_FLOAT_WEIGHT;

	}

	/**
	 * Discards the accumulated samples.
	 */
	reset() {

		this.samples = 0;
		this._guidesNeedUpdate = this._guides !== null;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._accumulation.dispose();
		this._renderTarget.dispose();
		this._frontMaterial.dispose();
		this._backMaterial.dispose();
		this._quad.material.dispose();

		if ( this._guides !== null ) {

			this._guides.dispose();
			for ( const material of this._guideMaterials ) material.dispose();

			// the guide proxies share the attributes of the meshes, only their chart attributes are freed.
			// The materials go first, with them the render objects that would free all attributes they used

			for ( const proxy of this._guideScene.children ) {

				const geometry = proxy.geometry;

				for ( const name of Object.keys( geometry.attributes ) ) {

					if ( name !== 'lightMapChart' ) geometry.deleteAttribute( name );

				}

				geometry.setIndex( null );
				geometry.dispose();

			}

		}

	}

	/**
	 * Adds a proxy of a mesh that rasterizes its surface and charts into the guides.
	 *
	 * @private
	 * @param {Mesh} object - The mesh.
	 */
	_addGuide( object ) {

		const source = object.geometry;
		const geometry = new BufferGeometry();

		for ( const name of [ 'position', 'normal', 'uv1' ] ) {

			if ( source.attributes[ name ] !== undefined ) geometry.setAttribute( name, source.attributes[ name ] );

		}

		geometry.setIndex( source.index );
		geometry.setDrawRange( source.drawRange.start, source.drawRange.count );
		for ( const group of source.groups ) geometry.addGroup( group.start, group.count, group.materialIndex );

		const chart = computeCharts( source );
		for ( let i = 0; i < chart.array.length; i ++ ) chart.array[ i ] += this._charts;
		this._charts += chart.count;
		geometry.setAttribute( 'lightMapChart', new BufferAttribute( chart.array, 1 ) );

		const [ frontMaterial, backMaterial ] = this._guideMaterials;
		const guideMaterial = material => material.side === BackSide ? backMaterial : frontMaterial;
		const material = Array.isArray( object.material ) ? object.material.map( guideMaterial ) : guideMaterial( object.material );

		const proxy = new Mesh( geometry, material );
		proxy.matrixAutoUpdate = false;
		proxy.frustumCulled = false;

		this._guideScene.add( proxy );
		this._guidesNeedUpdate = true;

	}

	/**
	 * Rasterizes the world-space positions, normals and chart indices of the meshes into the guides, with the
	 * jitters of a range of samples, so that the guides cover the texels that the samples cover, also at the
	 * borders of the charts. The texel centers come last, the interior texels keep them.
	 *
	 * @private
	 * @param {number} start - The first sample, 0 clears the guides.
	 * @param {number} end - The sample after the last one.
	 */
	_renderGuides( start, end ) {

		const renderer = this.renderer;

		renderer.setRenderTarget( this._guides );

		if ( start === 0 ) renderer.clear();

		for ( let i = start; i <= end; i ++ ) {

			if ( i < end ) this._jitter.value.set( halton( i + 1, 2 ) - 0.5, halton( i + 1, 3 ) - 0.5 ).multiplyScalar( 2 / this.size );
			else this._jitter.value.set( 0, 0 );

			renderer.render( this._guideScene, this._camera );

		}

		this._guidesNeedUpdate = false;

	}

	/**
	 * Creates a material that rasterizes meshes in UV space and outputs irradiance.
	 *
	 * @private
	 * @param {function(Node<vec3>, Node<vec3>, Node<float>): Node<vec3>} irradianceNode - The irradiance function.
	 * @param {boolean} flipNormal - Whether to flip the normal, for back-sided meshes.
	 * @param {Array<Light>} directLights - Direct lights to include.
	 * @return {NodeMaterial} The material.
	 */
	_createBakeMaterial( irradianceNode, flipNormal, directLights ) {

		const material = directLights.length > 0 ? new MeshLambertNodeMaterial() : new NodeMaterial();
		material.side = DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;

		// additive blending, the sample count, the sum of the sample weights, accumulates in alpha

		material.blending = CustomBlending;
		material.blendSrc = OneFactor;
		material.blendDst = OneFactor;

		material.vertexNode = vec4( uv( 1 ).flipY().mul( 2 ).sub( 1 ).add( this._jitter ), 0, 1 );

		const normal = flipNormal ? normalWorldGeometry.negate() : normalWorldGeometry;

		// for the variance, the luminance of each sample and its square accumulate in the second target

		const accumulateMoments = this._accumulation.textures.length > 1;
		const outputs = ( value ) => accumulateMoments ? mrt( { output: value, moment: vec2( luminance( value.rgb ), luminance( value.rgb ).pow2() ) } ) : value;

		if ( directLights.length > 0 ) {

			// bake diffuse irradiance with white albedo, leaving specular lighting out

			material.lightsNode = lights( directLights ).context( { positionView: modelViewMatrix.mul( positionLocal ).xyz.toVarying() } );
			material.normalNode = flipNormal ? normalViewGeometry.negate() : normalViewGeometry;
			material.emissiveNode = irradianceNode( positionWorld, normal, this._sample ).div( Math.PI );
			material.outputNode = vec4( output.rgb.mul( Math.PI ), 1 ).mul( this._weight );
			if ( accumulateMoments ) material.mrtNode = outputs( material.outputNode );

		} else {

			material.fragmentNode = outputs( vec4( irradianceNode( positionWorld, normal, this._sample ), 1 ).mul( this._weight ) );

		}

		return material;

	}

	/**
	 * Creates the material that rasterizes the guides in UV space.
	 *
	 * @private
	 * @param {boolean} flipNormal - Whether to flip the normal, for back-sided meshes.
	 * @return {NodeMaterial} The material.
	 */
	_createGuideMaterial( flipNormal ) {

		const material = new NodeMaterial();
		material.side = DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;
		material.blending = NoBlending;

		material.vertexNode = vec4( uv( 1 ).flipY().mul( 2 ).sub( 1 ).add( this._jitter ), 0, 1 );

		const normal = flipNormal ? normalWorldGeometry.negate() : normalWorldGeometry;
		const chart = round( attribute( 'lightMapChart', 'float' ) ).add( 1 );

		material.fragmentNode = mrt( { position: vec4( positionWorld, chart ), normal: vec4( normal.normalize(), 1 ) } );

		return material;

	}

}

/**
 * Finds the charts of a geometry: the sets of triangles that share light map vertices.
 *
 * @private
 * @param {BufferGeometry} geometry - A geometry with `uv1`.
 * @return {{array: Float32Array, count: number}} The chart index of each vertex and the number of charts.
 */
function computeCharts( geometry ) {

	const uv = geometry.getAttribute( 'uv1' );
	const index = geometry.getIndex();
	const parent = new Int32Array( uv.count );

	for ( let i = 0; i < parent.length; i ++ ) parent[ i ] = i;

	const find = ( i ) => {

		while ( parent[ i ] !== i ) i = parent[ i ] = parent[ parent[ i ] ];
		return i;

	};

	const union = ( a, b ) => {

		a = find( a );
		b = find( b );
		if ( a !== b ) parent[ Math.max( a, b ) ] = Math.min( a, b );

	};

	// vertices at the same light map position, and the vertices of each triangle

	const vertices = new Map();

	for ( let i = 0; i < uv.count; i ++ ) {

		const key = `${ uv.getX( i ) },${ uv.getY( i ) }`;
		const other = vertices.get( key );

		if ( other === undefined ) vertices.set( key, i );
		else union( i, other );

	}

	const count = index !== null ? index.count : uv.count;
	const vertex = ( i ) => index !== null ? index.getX( i ) : i;

	for ( let i = 0; i + 2 < count; i += 3 ) {

		union( vertex( i ), vertex( i + 1 ) );
		union( vertex( i ), vertex( i + 2 ) );

	}

	const array = new Float32Array( uv.count );
	const ids = new Map();

	for ( let i = 0; i < array.length; i ++ ) {

		const root = find( i );
		if ( ids.has( root ) === false ) ids.set( root, ids.size );
		array[ i ] = ids.get( root );

	}

	return { array, count: ids.size };

}

function halton( index, base ) {

	let result = 0;
	let f = 1;

	while ( index > 0 ) {

		f /= base;
		result += f * ( index % base );
		index = Math.floor( index / base );

	}

	return result;

}

export { LightMapper };
