import {
	HalfFloatType,
	LinearFilter,
	LinearMipmapLinearFilter,
	NearestFilter,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { SSISTraceShader, SSISResolveShader } from '../shaders/SSISShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * Screen-space indirect specular (SSIS) computed as prefiltered incoming specular radiance, meant to
 * be consumed by the material lighting through {@link Scene#ssisMap}
 * instead of being composited over the beauty image.
 *
 * Each pixel traces rays through the depth buffer, importance-sampled from its GGX
 * specular lobe (or one mirror ray with `stochastic = false`). A hit returns the lit scene
 * color; a miss (or the screen border) fades to the scene's PMREM environment sampled at
 * the surface roughness. Stochastic mode publishes the current frame without temporal smoothing;
 * otherwise the result is blurred by the reflection cone footprint over its mip chain.
 * Materials apply their own BRDF to the result.
 *
 * Inputs come from a {@link GBufferPass} created with `{ material: true }`. Place this
 * pass after the pass that renders the lit scene, and assign {@link SSISPass#texture} to
 * `scene.ssisMap` once. The pass reads the lit color of the current frame
 * and the scene consumes the result on the next frame, so reflections lag by one
 * frame under motion and the first frame has no specular. The lit color already contains
 * the previous reflections, which gives free multiple bounces.
 *
 * Perspective cameras only. The environment is `scene.environment` and must be a PMREM
 * texture (see {@link PMREMGenerator}); its rotation is ignored.
 *
 * ```js
 * const gBufferPass = new GBufferPass( scene, camera, width, height, { material: true } );
 * const ssisPass = new SSISPass( scene, camera, width, height, gBufferPass );
 * scene.ssisMap = ssisPass.texture;
 * composer.addPass( gBufferPass );
 * composer.addPass( new RenderPass( scene, camera ) );
 * composer.addPass( ssisPass );
 * ```
 *
 * @augments Pass
 * @three_import import { SSISPass } from 'three/addons/postprocessing/SSISPass.js';
 */
class SSISPass extends Pass {

	/**
	 * @param {Scene} scene - The scene (its environment is used for misses).
	 * @param {PerspectiveCamera} camera - The camera.
	 * @param {number} width - Width in physical pixels.
	 * @param {number} height - Height in physical pixels.
	 * @param {GBufferPass} gBufferPass - A G-buffer pass created with `{ material: true }`.
	 */
	constructor( scene, camera, width, height, gBufferPass ) {

		super();

		this.scene = scene;
		this.camera = camera;
		this.needsSwap = false;

		/**
		 * Maximum reflection ray length in world units.
		 *
		 * @type {number}
		 * @default 10
		 */
		this.maxDistance = 10;

		/**
		 * Depth tolerance behind a surface that still counts as a hit.
		 *
		 * @type {number}
		 * @default 0.01
		 */
		this.thickness = 0.01;

		/**
		 * Width in UV units over which hits fade to the environment near the screen border.
		 *
		 * @type {number}
		 * @default 0.2
		 */
		this.screenEdgeFade = 0.2;

		/**
		 * Ray march sample density from 0 to 1. In stochastic mode a ray takes
		 * `quality * 64` samples, spaced to concentrate near the origin; otherwise one sample is
		 * taken every `1 / quality` pixels along the ray. Lower is faster but can miss thin geometry.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.quality = 1;

		this._stochastic = true;
		this._resolutionScale = 1;
		this._width = width;
		this._height = height;

		/**
		 * Number of GGX-sampled rays per pixel in stochastic mode (1 to 64). More rays means
		 * less noise and proportionally higher cost.
		 *
		 * @type {number}
		 * @default 16
		 */
		this.rayCount = 16;

		this._frame = 0;

		this._traceTarget = new WebGLRenderTarget( width, height, {
			type: HalfFloatType,
			minFilter: LinearMipmapLinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: true,
			depthBuffer: false
		} );

		this._resolveTarget = new WebGLRenderTarget( width, height, {
			type: HalfFloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false
		} );

		this._traceMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SSISTraceShader.defines ),
			uniforms: UniformsUtils.clone( SSISTraceShader.uniforms ),
			vertexShader: SSISTraceShader.vertexShader,
			fragmentShader: SSISTraceShader.fragmentShader,
			blending: NoBlending
		} );

		this._resolveMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( SSISResolveShader.uniforms ),
			vertexShader: SSISResolveShader.vertexShader,
			fragmentShader: SSISResolveShader.fragmentShader,
			blending: NoBlending
		} );

		this._copyMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending
		} );

		this._traceMaterial.uniforms.tDepth.value = gBufferPass.depthTexture;
		this._traceMaterial.uniforms.tNormal.value = gBufferPass.normalTexture;
		this._traceMaterial.uniforms.tMaterial.value = gBufferPass.materialTexture;
		this._resolveMaterial.uniforms.tRadiance.value = this._traceTarget.texture;

		this._fsQuad = new FullScreenQuad( null );
		this._environment = null;

		this.setSize( width, height );

	}

	/**
	 * Whether rays are importance-sampled from the GGX lobe (`true`) or a single mirror ray
	 * is traced and blurred by the cone footprint (`false`).
	 *
	 * @type {boolean}
	 * @default true
	 */
	get stochastic() {

		return this._stochastic;

	}

	set stochastic( value ) {

		if ( value === this._stochastic ) return;

		this._stochastic = value;
		this._traceMaterial.defines.STOCHASTIC = value;
		this._traceMaterial.needsUpdate = true;

	}

	/**
	 * Scale of the trace resolution from 0 to 1 relative to the G-buffer. The result is
	 * upsampled when resolved. Lower is faster.
	 *
	 * @type {number}
	 * @default 1
	 */
	get resolutionScale() {

		return this._resolutionScale;

	}

	set resolutionScale( value ) {

		if ( value === this._resolutionScale ) return;

		this._resolutionScale = value;
		this.setSize( this._width, this._height );

	}

	/**
	 * The prefiltered specular radiance texture. Assign it to `scene.ssisMap`.
	 * The texture identity is stable across resizes.
	 *
	 * @type {Texture}
	 * @readonly
	 */
	get texture() {

		return this._resolveTarget.texture;

	}

	/**
	 * Traces reflections from the lit color in the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - Unused.
	 * @param {WebGLRenderTarget} readBuffer - The lit scene color (linear, before tone mapping).
	 */
	render( renderer, writeBuffer, readBuffer ) {

		const camera = this.camera;
		const uniforms = this._traceMaterial.uniforms;
		const environment = this.scene.environment;
		const useEnv = environment !== null && environment.isPMREMTexture === true;

		if ( useEnv !== ( this._environment !== null ) ) {

			this._traceMaterial.defines.USE_ENV = useEnv;
			this._traceMaterial.needsUpdate = true;

		}

		this._environment = useEnv ? environment : null;

		if ( useEnv ) {

			uniforms.envMap.value = environment;
			uniforms.envMaxLod.value = environment.mipmaps.length - 1;
			uniforms.envIntensity.value = this.scene.environmentIntensity;

		}

		uniforms.tColor.value = readBuffer.texture;
		uniforms.cameraNear.value = camera.near;
		uniforms.cameraFar.value = camera.far;
		uniforms.cameraProjectionMatrix.value.copy( camera.projectionMatrix );
		uniforms.cameraInverseProjectionMatrix.value.copy( camera.projectionMatrixInverse );
		uniforms.cameraWorldMatrix.value.copy( camera.matrixWorld );
		uniforms.maxDistance.value = this.maxDistance;
		uniforms.thickness.value = this.thickness;
		uniforms.screenEdgeFade.value = this.screenEdgeFade;
		uniforms.quality.value = Math.min( Math.max( this.quality, 0.05 ), 1 );
		uniforms.rayCount.value = Math.min( Math.max( Math.round( this.rayCount ), 1 ), 64 );
		uniforms.frame.value = this._frame ++ % 64;

		const target = renderer.getRenderTarget();

		this._fsQuad.material = this._traceMaterial;
		renderer.setRenderTarget( this._traceTarget );
		this._fsQuad.render( renderer );

		if ( this._stochastic ) {

			this._copyMaterial.uniforms.tDiffuse.value = this._traceTarget.texture;
			this._fsQuad.material = this._copyMaterial;

		} else {

			this._fsQuad.material = this._resolveMaterial;

		}

		renderer.setRenderTarget( this._resolveTarget );
		this._fsQuad.render( renderer );

		renderer.setRenderTarget( target );

	}

	/**
	 * Resizes the pass. Must match the G-buffer and the render target the scene is drawn to.
	 *
	 * @param {number} width - Width in physical pixels.
	 * @param {number} height - Height in physical pixels.
	 */
	setSize( width, height ) {

		this._width = width;
		this._height = height;

		const traceWidth = Math.max( Math.round( width * this._resolutionScale ), 1 );
		const traceHeight = Math.max( Math.round( height * this._resolutionScale ), 1 );

		this._traceTarget.setSize( traceWidth, traceHeight );
		this._resolveTarget.setSize( width, height );

		const maxStep = Math.ceil( Math.sqrt( traceWidth * traceWidth + traceHeight * traceHeight ) );

		if ( this._traceMaterial.defines.MAX_STEP !== maxStep ) {

			this._traceMaterial.defines.MAX_STEP = maxStep;
			this._traceMaterial.needsUpdate = true;

		}

		this._traceMaterial.uniforms.resolution.value.set( traceWidth, traceHeight );
		this._resolveMaterial.uniforms.resolution.value.set( traceWidth, traceHeight );
		this._resolveMaterial.uniforms.maxMip.value = Math.floor( Math.log2( Math.max( traceWidth, traceHeight ) ) );

	}

	/**
	 * Frees the render targets and materials of this pass.
	 */
	dispose() {

		this._traceTarget.dispose();
		this._copyMaterial.dispose();
		this._resolveTarget.dispose();
		this._traceMaterial.dispose();
		this._resolveMaterial.dispose();
		this._fsQuad.dispose();

	}

}

export { SSISPass };
