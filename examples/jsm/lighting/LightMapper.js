import { BackSide, CustomBlending, DoubleSide, FloatType, HalfFloatType, InstancedMesh, Mesh, MeshLambertNodeMaterial, NodeMaterial, OneFactor, OrthographicCamera, PhongLightingModel, QuadMesh, RedFormat, RendererUtils, RenderTarget, Scene, Vector2, Vector4 } from 'three/webgpu';
import { Fn, If, Loop, Stack, cameraWorldMatrix, ivec2, length, lights, luminance, mrt, normalView, normalViewGeometry, normalWorldGeometry, output, positionWorld, screenCoordinate, textureLoad, uniform, vec3, vec4 } from 'three/tsl';

import { lightMapUV } from '../tsl/lighting/DirectionalLightMapNode.js';

// texels per side of the blocks that estimateNoise() sums on the GPU before reading them back

const NOISE_BLOCK = 16;

// the scale and offset of the light map UVs of the bake proxies, see addObjects()

const _uvTransforms = /*@__PURE__*/ new WeakMap();
const _identity = /*@__PURE__*/ new Vector4( 1, 1, 0, 0 );

let _rendererState;

/**
 * Bakes indirect diffuse irradiance into a light map. The irradiance is defined by a
 * function that returns a TSL node for a world-space position and normal, so any
 * global illumination technique can be baked, e.g. a {@link LightProbeGrid} via
 * `lightProbeGridIrradiance()` or a prepared {@link VXGIVolume} via `vxgiIrradiance()`.
 *
 * Meshes need light map UVs in the `uv1` attribute, e.g. generated with {@link unwrapUVs}.
 * Atlases of several pages bake into one light map per page, `mesh.userData.lightMapPage`
 * selects the page of a mesh. Instanced meshes bake each instance into its own atlas region,
 * see {@link lightMapUV}.
 * Each sample rasterizes the meshes in UV space with a sub-texel jitter and accumulates
 * the result. The function also receives the sample index, so stochastic sources like
 * `vxgiIrradiance()` can vary their samples and converge as they accumulate. Call
 * `update()` once per frame to bake progressively, or pass a sample count to bake at once.
 * Call `estimateNoise()` to stop once the light map has converged.
 * Keep the source geometry and GI data static while accumulating. Call `reset()`
 * after changing transforms or lighting. Atlas charts need at least three texels
 * of padding; the resolve fills two texels around covered surfaces.
 * Irradiance uses linear BT.709/sRGB primaries in lux.
 * With the `directional` option, the light mapper also bakes the dominant direction of the
 * incident light into {@link LightMapper#directionTexture}, so that normal maps show under baked
 * light, see `directionalLightMap()`.
 * Do not include material ambient occlusion, base color, or exposure in the source
 * irradiance. Material occlusion is applied once at runtime. Keep any contributions
 * included in the bake out of runtime diffuse lighting to avoid counting them twice.
 *
 * ```js
 * const lightMapper = new LightMapper( renderer, size, ( position, normal ) => lightProbeGridIrradiance( probes, position, normal ) );
 * lightMapper.addObjects( meshes );
 * lightMapper.update( 16 );
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
	 * @param {function(Node<vec3>, Node<vec3>, Node<float>, ?Node<vec3>): Node<vec3>} irradianceNode - Returns the irradiance for a world-space position, normal and sample index.
	 * With the `directional` option it also receives a vec3 variable, see {@link LightMapper#irradianceNode}.
	 * @param {Object} [options] - Bake options.
	 * @param {Array<Light>} [options.lights=[]] - Direct lights to include in the diffuse bake. Render their shadows in the source scene first, `update()` keeps their shadow maps.
	 * @param {boolean} [options.moments=false] - Whether to also sum the squared sample luminances into {@link LightMapper#momentTexture}, e.g. for a {@link LightMapDenoiser}. Requires the 'float32-blendable' renderer feature.
	 * @param {boolean} [options.directional=false] - Whether to also bake the dominant direction of the incident light into {@link LightMapper#directionTexture}.
	 * @param {number} [options.pages=1] - The number of light map pages, each one of `size`, e.g. the `pages` of {@link unwrapUVs}.
	 */
	constructor( renderer, size, irradianceNode, { lights = [], moments = false, directional = false, pages = 1 } = {} ) {

		/**
		 * The renderer.
		 *
		 * @type {WebGPURenderer}
		 */
		this.renderer = renderer;

		/**
		 * The source of indirect irradiance. For directional light maps, the function receives a vec3
		 * variable as its fourth argument, `direction`, and adds the luminance-weighted directions to
		 * the incident light to it: the sum of `luminance( E_i ) * L_i` over the parts `E_i` of the
		 * irradiance estimate, which arrive from the world-space unit directions `L_i`, scaled like
		 * the irradiance. Its length over the luminance of the irradiance is the directionality, from 0
		 * for light from all directions to 1 for light from one direction. Sources that ignore it
		 * bake flat light.
		 *
		 * @type {function(Node<vec3>, Node<vec3>, Node<float>, ?Node<vec3>): Node<vec3>}
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

		// the samples are summed with additive blending, into float targets if the renderer supports
		// 'float32-blendable'. Half floats count exactly only up to 2048 samples, more samples would
		// stop the count while the sums keep growing

		const floatBlendable = renderer.hasFeature( 'float32-blendable' );

		// WebGPU guarantees 32 bytes of color attachments per sample, so with directions the moments
		// accumulate in the unused alpha channel of the direction sums

		const outputs = [ 'output' ];

		if ( moments && floatBlendable && directional === false ) outputs.push( 'moment' );
		if ( directional ) outputs.push( 'direction' );

		this._maxSamples = floatBlendable ? Infinity : 2048;

		/**
		 * The channel of {@link LightMapper#momentTexture} that holds the moments, `'a'` if it is shared
		 * with the direction sums of the `directional` option, else `'r'`.
		 *
		 * @type {string}
		 */
		this.momentChannel = moments && floatBlendable && directional ? 'a' : 'r';

		/**
		 * The pages of the light map, each one with its light map, directions and moments like the ones
		 * of the light mapper, which are the ones of the first page, the meshes baked into it, and its
		 * `sampleTexture`: the sums of the samples with their count in alpha, before the normalization
		 * and padding of the light map. Texels without samples are zero.
		 *
		 * @type {Array<{texture: Texture, directionTexture: ?Texture, sampleTexture: Texture, momentTexture: ?Texture, objects: Array<Mesh>}>}
		 * @readonly
		 */
		this.pages = [];

		this._pages = [];

		for ( let i = 0; i < pages; i ++ ) this._createPage( floatBlendable ? FloatType : HalfFloatType, outputs, moments && floatBlendable );

		/**
		 * The sums of the squared sample luminances, with the `moments` option and the 'float32-blendable'
		 * renderer feature, else `null`. Half floats would overflow.
		 *
		 * @type {?Texture}
		 */
		this.momentTexture = this.pages[ 0 ].momentTexture;

		/**
		 * The baked light map. It stores linear diffuse irradiance in lux, without baked
		 * albedo, material ambient occlusion, or display exposure, and uses `uv1`.
		 * Values are not divided by pi, matching the runtime light map input.
		 *
		 * @type {Texture}
		 */
		this.texture = this.pages[ 0 ].texture;

		/**
		 * The dominant directions of the incident light, with the `directional` option, else `null`.
		 * The RGB channels encode the luminance-weighted average of the world-space directions to the
		 * light like a normal map, `direction = rgb * 2 - 1`. Its length is the directionality, 0 for
		 * light from all directions and 1 for light from one direction. It shares the UVs of
		 * {@link LightMapper#texture}.
		 *
		 * @type {?Texture}
		 */
		this.directionTexture = this.pages[ 0 ].directionTexture;

		this._camera = new OrthographicCamera();
		this._objects = [];
		this._proxies = [];
		this._jitter = uniform( new Vector2() );
		this._sample = uniform( 0 );

		// the light map UVs of each proxy can be scaled and offset, e.g. to bake pages into tiles of one texture

		this._uvTransform = uniform( new Vector4() ).onObjectUpdate( ( { object } ) => _uvTransforms.get( object ) ?? _identity );

		this._lights = lights;
		this._frontMaterial = this._createBakeMaterial( irradianceNode, false, lights );
		this._backMaterial = this._createBakeMaterial( irradianceNode, true, lights );

		// noise estimation, created on first use: a luminance snapshot and its change summed per block

		this._snapshotSamples = 0;
		this._resets = 0;
		this._variance = 0;
		this._varianceSamples = 0;
		this._noise = Infinity;
		this._floor = uniform( 0 );

	}

	/**
	 * Creates the render targets, the resolve pass and the scene of a page.
	 *
	 * @private
	 * @param {number} type - The type of the accumulation target.
	 * @param {Array<string>} outputs - The outputs of the accumulation target.
	 * @param {boolean} moments - Whether to accumulate the squared sample luminances.
	 */
	_createPage( type, outputs, moments ) {

		const size = this.size;
		const directional = outputs.includes( 'direction' );

		const accumulationTarget = new RenderTarget( size, size, { type, depthBuffer: false, count: outputs.length } );
		const renderTarget = new RenderTarget( size, size, { type: HalfFloatType, depthBuffer: false, count: directional ? 2 : 1 } );
		renderTarget.texture.channel = 1;

		let momentTexture = null, directionSums = null, directionTexture = null;

		if ( accumulationTarget.textures.length > 1 ) {

			outputs.forEach( ( name, i ) => accumulationTarget.textures[ i ].name = name );

			if ( outputs.includes( 'moment' ) ) {

				momentTexture = accumulationTarget.textures[ outputs.indexOf( 'moment' ) ];
				momentTexture.format = RedFormat;

			}

			if ( directional ) directionSums = accumulationTarget.textures[ outputs.indexOf( 'direction' ) ];
			if ( moments && directional ) momentTexture = directionSums;

		}

		if ( directional ) {

			renderTarget.texture.name = 'output';
			directionTexture = renderTarget.textures[ 1 ];
			directionTexture.name = 'direction';
			directionTexture.channel = 1;

		}

		// normalize the accumulated samples and fill the chart padding

		const accumulation = accumulationTarget.texture;
		const maxCoord = ivec2( size - 1 );

		// the average direction of a texel is its luminance-weighted direction sum over its luminance sum

		const texelDirection = ( value, coord ) => {

			const direction = textureLoad( directionSums, coord ).xyz.div( luminance( value.rgb ).max( 1e-20 ) );

			return direction.div( length( direction ).max( 1 ) );

		};

		const direction = directionSums !== null ? vec3( 0 ).toVar( 'direction' ) : null;

		const resolve = Fn( () => {

			const coord = ivec2( screenCoordinate.xy );
			const center = textureLoad( accumulation, coord ).toVar();
			const sum = vec4( 0 ).toVar();

			if ( direction !== null ) direction.assign( texelDirection( center, coord ) );

			If( center.a.equal( 0 ), () => {

				Loop( { start: - 2, end: 2, condition: '<=', name: 'x' }, { start: - 2, end: 2, condition: '<=', name: 'y' }, ( { x, y } ) => {

					const neighbor = coord.add( ivec2( x, y ) ).clamp( ivec2( 0 ), maxCoord ).toVar();
					const value = textureLoad( accumulation, neighbor ).toVar();

					If( value.a.greaterThan( 0 ), () => {

						sum.addAssign( vec4( value.rgb.div( value.a ), 1 ) );

						if ( direction !== null ) direction.addAssign( texelDirection( value, neighbor ) );

					} );

				} );

				center.assign( sum );

				if ( direction !== null ) direction.divAssign( sum.a.max( 1 ) );

			} );

			return vec4( center.rgb.div( center.a.max( 1e-4 ) ), 1 );

		} );

		// the directions are encoded like a normal map

		const resolveMaterial = new NodeMaterial();
		resolveMaterial.fragmentNode = direction !== null ? mrt( { output: resolve(), direction: vec4( direction.mul( 0.5 ).add( 0.5 ), 1 ) } ) : resolve();

		this.pages.push( { texture: renderTarget.texture, directionTexture, sampleTexture: accumulation, momentTexture, objects: [] } );
		this._pages.push( { accumulation: accumulationTarget, renderTarget, directionSums, quad: new QuadMesh( resolveMaterial ), scene: new Scene(), snapshot: null, noiseTarget: null, noiseQuad: null, snapshotQuad: null } );

	}

	/**
	 * Adds meshes to the light map. Their geometries must provide `uv1`.
	 * Each mesh is baked into the page of its `userData.lightMapPage`, or the first one. The instances
	 * of instanced meshes are baked into the atlas regions of {@link lightMapUV}. Skinned and batched
	 * meshes are not supported.
	 *
	 * @param {Array<Mesh>} objects - The meshes to add.
	 * @param {Object} [options] - The options.
	 * @param {number} [options.page] - The page of the meshes, instead of their `userData.lightMapPage`.
	 * @param {?Vector4} [options.uvTransform=null] - Scales the light map UVs of the meshes by its `x` and `y`
	 * and offsets them by its `z` and `w`, e.g. to bake the pages of an atlas into tiles of one light map.
	 */
	addObjects( objects, { page, uvTransform = null } = {} ) {

		for ( const object of objects ) {

			const index = page ?? object.userData.lightMapPage ?? 0;

			const bakeMaterial = material => material.side === BackSide ? this._backMaterial : this._frontMaterial;
			const material = Array.isArray( object.material ) ? object.material.map( bakeMaterial ) : bakeMaterial( object.material );

			// instances share the transforms of the mesh, but not its colors, which are no irradiance

			const proxy = object.isInstancedMesh ? new InstancedMesh( object.geometry, material, object.count ) : new Mesh( object.geometry, material );
			if ( object.isInstancedMesh ) proxy.instanceMatrix = object.instanceMatrix;
			proxy.matrixAutoUpdate = false;
			proxy.frustumCulled = false;
			proxy.receiveShadow = object.receiveShadow;

			if ( uvTransform !== null ) _uvTransforms.set( proxy, uvTransform.clone() );

			this._pages[ index ].scene.add( proxy );
			this.pages[ index ].objects.push( object );
			this._objects.push( object );
			this._proxies.push( proxy );

		}

	}

	/**
	 * Accumulates samples into the light map. Without the 'float32-blendable' renderer feature,
	 * at most 2048 samples are accumulated.
	 *
	 * @param {number} [samples=1] - The number of samples to add.
	 */
	update( samples = 1 ) {

		const renderer = this.renderer;

		samples = Math.min( samples, this._maxSamples - this.samples );

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		renderer.autoClear = false;
		renderer.setClearColor( 0x000000, 0 );

		if ( this.samples === 0 ) {

			for ( const page of this._pages ) {

				renderer.setRenderTarget( page.accumulation );
				renderer.clear();

			}

		}

		for ( let i = 0; i < this._objects.length; i ++ ) {

			const object = this._objects[ i ];

			object.updateWorldMatrix( true, false );
			this._proxies[ i ].matrix.copy( object.matrixWorld );
			if ( object.isInstancedMesh ) this._proxies[ i ].count = object.count;

		}

		// keep the shadow maps of the direct lights, rendering them from the UV bake would miss the casters

		const shadows = this._lights.filter( ( light ) => light.shadow !== undefined ).map( ( { shadow } ) => [ shadow, shadow.autoUpdate, shadow.needsUpdate ] );

		for ( const [ shadow ] of shadows ) shadow.autoUpdate = shadow.needsUpdate = false;

		for ( let i = 0; i < samples; i ++ ) {

			this._sample.value = this.samples;
			this._jitter.value.set( halton( this.samples + 1, 2 ) - 0.5, halton( this.samples + 1, 3 ) - 0.5 ).multiplyScalar( 2 / this.size );

			for ( const page of this._pages ) {

				renderer.setRenderTarget( page.accumulation );
				renderer.render( page.scene, this._camera );

			}

			this.samples ++;

		}

		for ( const [ shadow, autoUpdate, needsUpdate ] of shadows ) {

			shadow.autoUpdate = autoUpdate;
			shadow.needsUpdate = needsUpdate;

		}

		for ( const page of this._pages ) {

			renderer.setRenderTarget( page.renderTarget );
			page.quad.render( renderer );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

	}

	/**
	 * Estimates the noise left in the light map from how much it changed since the previous call:
	 * while independent samples accumulate, the change between `n` and `n + k` samples has the
	 * variance of the light map itself scaled by `k / n`. The variance of a single sample, measured
	 * this way, is averaged over the calls since the reset, weighted by their new samples, so the
	 * estimate is stable and falls with the square root of the samples. The estimate is the RMS
	 * error of the texel luminance relative to the texel luminance, so dim and bright regions count
	 * alike, the error of texels darker than a tenth of the RMS luminance is measured relative to
	 * that. The first call after a reset only records the light map and resolves to `Infinity`.
	 * Call it as the samples grow, e.g. by a quarter, and stop baking once the estimate drops below
	 * a tolerance. The estimate covers all pages.
	 *
	 * @async
	 * @return {Promise<number>} A promise that resolves with the estimated relative noise.
	 */
	async estimateNoise() {

		const renderer = this.renderer;

		if ( this._pages[ 0 ].snapshot === null ) {

			for ( const page of this._pages ) this._createNoiseEstimator( page );

		}

		const previous = this._snapshotSamples;
		const added = this.samples - previous;
		const resets = this._resets;

		if ( previous > 0 && added === 0 ) return this._noise;

		_rendererState = RendererUtils.resetRendererState( renderer, _rendererState );

		for ( const page of this._pages ) {

			renderer.setRenderTarget( page.noiseTarget );
			page.noiseQuad.render( renderer );

			renderer.setRenderTarget( page.snapshot );
			page.snapshotQuad.render( renderer );

		}

		RendererUtils.restoreRendererState( renderer, _rendererState );

		this._snapshotSamples = this.samples;

		const pages = await Promise.all( this._pages.map( ( { noiseTarget } ) => renderer.readRenderTargetPixelsAsync( noiseTarget, 0, 0, noiseTarget.width, noiseTarget.height ) ) );

		// samples discarded while reading back

		if ( resets !== this._resets ) return Infinity;

		let change = 0, power = 0, texels = 0;

		for ( const sums of pages ) {

			for ( let i = 0; i < sums.length; i += 4 ) {

				change += sums[ i ];
				power += sums[ i + 1 ];
				texels += sums[ i + 2 ];

			}

		}

		this._floor.value = texels > 0 ? 0.01 * power / texels : 0;

		if ( previous === 0 ) return Infinity;

		const samples = previous + added;

		this._variance += texels > 0 ? change / texels * previous * samples : 0;
		this._varianceSamples += added;
		this._noise = Math.sqrt( this._variance / this._varianceSamples / samples );

		return this._noise;

	}

	/**
	 * Discards the accumulated samples.
	 */
	reset() {

		this.samples = 0;
		this._snapshotSamples = 0;
		this._resets ++;
		this._variance = 0;
		this._varianceSamples = 0;

	}

	/**
	 * Frees all internal resources.
	 */
	dispose() {

		this._frontMaterial.dispose();
		this._backMaterial.dispose();

		for ( const page of this._pages ) {

			page.accumulation.dispose();
			page.renderTarget.dispose();
			page.quad.material.dispose();

			if ( page.snapshot !== null ) {

				page.snapshot.dispose();
				page.noiseTarget.dispose();
				page.noiseQuad.material.dispose();
				page.snapshotQuad.material.dispose();

			}

		}

	}

	/**
	 * Creates the targets and passes of `estimateNoise()` for a page.
	 *
	 * @private
	 * @param {Object} page - The page.
	 */
	_createNoiseEstimator( page ) {

		const size = this.size;
		const blocks = Math.ceil( size / NOISE_BLOCK );

		// texels without samples are stored as -1

		page.snapshot = new RenderTarget( size, size, { type: HalfFloatType, format: RedFormat, depthBuffer: false } );
		page.noiseTarget = new RenderTarget( blocks, blocks, { type: FloatType, depthBuffer: false } );

		const accumulation = page.accumulation.texture;
		const snapshot = page.snapshot.texture;

		const texelLuminance = ( value ) => value.a.greaterThan( 0 ).select( luminance( value.rgb ).div( value.a ), - 1 );

		const snapshotMaterial = new NodeMaterial();
		snapshotMaterial.fragmentNode = vec4( texelLuminance( textureLoad( accumulation, ivec2( screenCoordinate.xy ) ) ), 0, 0, 1 );

		// sums the squared relative change, the squared luminance and the texel count of a block

		const floor = this._floor;

		const reduce = Fn( () => {

			const origin = ivec2( screenCoordinate.xy ).mul( NOISE_BLOCK );
			const sum = vec4( 0 ).toVar();

			Loop( NOISE_BLOCK, NOISE_BLOCK, ( { i, j } ) => {

				const coord = origin.add( ivec2( i, j ) );

				If( coord.x.lessThan( size ).and( coord.y.lessThan( size ) ), () => {

					const current = texelLuminance( textureLoad( accumulation, coord ) );
					const previous = textureLoad( snapshot, coord ).r;

					If( current.greaterThanEqual( 0 ), () => {

						const change = previous.greaterThanEqual( 0 ).select( current.sub( previous ).pow2(), 0 );

						sum.addAssign( vec4( change.div( current.pow2().add( floor ).max( 1e-12 ) ), current.pow2(), 1, 0 ) );

					} );

				} );

			} );

			return sum;

		} );

		const noiseMaterial = new NodeMaterial();
		noiseMaterial.fragmentNode = reduce();

		page.snapshotQuad = new QuadMesh( snapshotMaterial );
		page.noiseQuad = new QuadMesh( noiseMaterial );

	}

	/**
	 * Creates a material that rasterizes meshes in UV space and outputs irradiance.
	 *
	 * @private
	 * @param {function(Node<vec3>, Node<vec3>, Node<float>, ?Node<vec3>): Node<vec3>} irradianceNode - The irradiance function.
	 * @param {boolean} flipNormal - Whether to flip the normal, for back-sided meshes.
	 * @param {Array<Light>} directLights - Direct lights to include.
	 * @return {NodeMaterial} The material.
	 */
	_createBakeMaterial( irradianceNode, flipNormal, directLights ) {

		const material = directLights.length > 0 ? new MeshLambertNodeMaterial() : new NodeMaterial();
		material.side = DoubleSide;
		material.depthTest = false;
		material.depthWrite = false;

		// additive blending, the sample count accumulates in alpha

		material.blending = CustomBlending;
		material.blendSrc = OneFactor;
		material.blendDst = OneFactor;

		// the clip position rasterizes the light map UVs. Unlike a vertexNode, which would make the view position
		// a reconstruction from the clip position, this keeps the positions that point and spot lights need

		const clipPosition = vec4( lightMapUV().mul( this._uvTransform.xy ).add( this._uvTransform.zw ).flipY().mul( 2 ).sub( 1 ).add( this._jitter ), 0, 1 );

		material.setupModelViewProjection = () => clipPosition;

		const normal = flipNormal ? normalWorldGeometry.negate() : normalWorldGeometry;

		// the luminance-weighted directions of the source and of the direct lights. The variable of the
		// source is declared before the irradiance, so that the source can add to it in its loops

		const directional = this.directionTexture !== null;
		const direction = directional ? vec3( 0 ).toVar( 'sourceDirection' ) : null;
		const lightDirection = directional && directLights.length > 0 ? vec3( 0 ).toVar( 'lightDirection' ) : null;

		const irradiance = Fn( () => {

			if ( direction !== null ) Stack( direction );

			return irradianceNode( positionWorld, normal, this._sample, direction );

		} )();

		// the squared luminance of each sample accumulates in a second target, for variance estimates,
		// and the directions in another one

		const outputs = ( value ) => {

			if ( this.momentTexture === null && direction === null ) return value;

			const members = { output: value };

			const moment = this.momentTexture !== null ? luminance( value.rgb ).pow2() : 0;

			if ( direction !== null ) members.direction = vec4( lightDirection !== null ? direction.add( lightDirection ) : direction, moment );
			else if ( this.momentTexture !== null ) members.moment = moment;

			return mrt( members );

		};

		if ( directLights.length > 0 ) {

			// bake diffuse irradiance with white albedo, leaving specular lighting out

			material.lightsNode = lights( directLights );
			material.normalNode = flipNormal ? normalViewGeometry.negate() : normalViewGeometry;
			material.emissiveNode = irradiance.div( Math.PI );
			material.outputNode = vec4( output.rgb.mul( Math.PI ), 1 );
			if ( this.momentTexture !== null || direction !== null ) material.mrtNode = outputs( material.outputNode );
			if ( lightDirection !== null ) material.setupLightingModel = () => new DirectionalLambertLightingModel( lightDirection );

		} else {

			material.fragmentNode = outputs( vec4( irradiance, 1 ) );

		}

		return material;

	}

}

/**
 * A Lambert lighting model that also sums the luminance-weighted directions to the direct lights.
 *
 * @private
 * @augments PhongLightingModel
 */
class DirectionalLambertLightingModel extends PhongLightingModel {

	/**
	 * Constructs a new directional Lambert lighting model.
	 *
	 * @param {Node<vec3>} direction - The variable that sums the directions.
	 */
	constructor( direction ) {

		super( false );

		this.direction = direction;

	}

	start( builder ) {

		// declares the variable before the lights add to it

		this.direction.assign( vec3( 0 ) );

		super.start( builder );

	}

	direct( lightData, builder ) {

		super.direct( lightData, builder );

		const { lightDirection, lightColor } = lightData;
		const irradiance = normalView.dot( lightDirection ).clamp().mul( lightColor );

		this.direction.addAssign( cameraWorldMatrix.mul( vec4( lightDirection, 0 ) ).xyz.mul( luminance( irradiance ) ) );

	}

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
