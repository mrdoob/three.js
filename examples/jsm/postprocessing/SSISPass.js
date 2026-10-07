import {
	HalfFloatType,
	LinearFilter,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { validateGBuffer, validateGBufferTextures } from './GBufferUtils.js';
import { SSISShader } from '../shaders/SSISShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * Screen-space indirect specular (SSIS) computed as prefiltered incoming specular radiance, meant to
 * be consumed by the material lighting through {@link Scene#indirectSpecularMap}
 * instead of being composited over the beauty image.
 *
 * Each pixel traces rays through the depth buffer, importance-sampled from its GGX
 * specular lobe. A hit returns the lit scene color; a miss (or the screen border) fades to
 * the scene's PMREM environment sampled at the surface roughness. Materials apply their own
 * BRDF to the result.
 *
 * Inputs come from a {@link GBufferPass} created with `{ material: true }` and must be set
 * with {@link SSISPass#setGBuffer}. Place this pass after the pass that renders the lit scene,
 * and assign {@link SSISPass#texture} to `scene.indirectSpecularMap` once. The pass reads
 * the lit color of the current frame and the scene consumes the result on the next frame,
 * so reflections lag by one frame under motion and the first frame has no specular. The lit
 * color already contains the previous reflections, which gives free multiple bounces.
 *
 * Perspective cameras only. The environment is `scene.environment` and must be a PMREM
 * texture (see {@link PMREMGenerator}); its rotation is ignored.
 *
 * ```js
 * const gBufferPass = new GBufferPass( scene, camera, width, height, { material: true } );
 * const ssisPass = new SSISPass( scene, camera, width, height );
 * ssisPass.setGBuffer( gBufferPass.depthTexture, gBufferPass.normalTexture, gBufferPass.materialTexture );
 * scene.indirectSpecularMap = ssisPass.texture;
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
	 * Constructs a new SSIS pass.
	 *
	 * @param {Scene} scene - The scene (its environment is used for misses).
	 * @param {PerspectiveCamera} camera - The camera.
	 * @param {number} [width=512] - Width in physical pixels.
	 * @param {number} [height=512] - Height in physical pixels.
	 */
	constructor( scene, camera, width = 512, height = 512 ) {

		super();

		/**
		 * The scene, its environment is used for misses.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera.
		 *
		 * @type {PerspectiveCamera}
		 */
		this.camera = camera;

		/**
		 * The width of the effect in physical pixels.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.width = width;

		/**
		 * The height of the effect in physical pixels.
		 *
		 * @type {number}
		 * @default 512
		 */
		this.height = height;

		/**
		 * Overwritten to disable the swap, the pass only reads the read buffer.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		/**
		 * Maximum reflection ray length in world units.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.maxDistance = 8;

		/**
		 * Depth tolerance behind a surface that still counts as a hit, in world units.
		 *
		 * @type {number}
		 * @default 0.12
		 */
		this.thickness = 0.12;

		/**
		 * Width in UV units over which hits fade to the environment near the screen border.
		 *
		 * @type {number}
		 * @default 0.2
		 */
		this.screenEdgeFade = 0.2;

		/**
		 * Ray march sample density from 0.05 to 1. A ray takes `quality * 64` samples, spaced
		 * to concentrate near the origin. Lower is faster but can miss thin geometry.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.quality = 1;

		/**
		 * Number of GGX-sampled rays per pixel (1 to 64). More rays means less noise and
		 * proportionally higher cost.
		 *
		 * @type {number}
		 * @default 8
		 */
		this.rayCount = 8;

		/**
		 * The depth texture of the G-buffer, see {@link SSISPass#setGBuffer}.
		 *
		 * @type {?DepthTexture}
		 * @default null
		 */
		this.depthTexture = null;

		/**
		 * The normal texture of the G-buffer, see {@link SSISPass#setGBuffer}.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.normalTexture = null;

		/**
		 * The material (roughness) texture of the G-buffer, see {@link SSISPass#setGBuffer}.
		 *
		 * @type {?Texture}
		 * @default null
		 */
		this.materialTexture = null;

		this._downSample = 2;
		this._frame = 0;

		this._traceTarget = new WebGLRenderTarget( width, height, {
			type: HalfFloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			depthBuffer: false
		} );

		this._renderTarget = new WebGLRenderTarget( width, height, {
			type: HalfFloatType,
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			depthBuffer: false
		} );

		this._traceMaterial = new ShaderMaterial( {
			name: SSISShader.name,
			defines: Object.assign( {}, SSISShader.defines ),
			uniforms: UniformsUtils.clone( SSISShader.uniforms ),
			vertexShader: SSISShader.vertexShader,
			fragmentShader: SSISShader.fragmentShader,
			blending: NoBlending
		} );

		this._copyMaterial = new ShaderMaterial( {
			name: CopyShader.name,
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending
		} );

		this._copyMaterial.uniforms.tDiffuse.value = this._traceTarget.texture;

		this._fsQuad = new FullScreenQuad( null );
		this._environment = null;

		this.setSize( width, height );

	}

	/**
	 * How many times smaller the trace resolution is than the G-buffer, as an integer from 1
	 * to 4. The result is upsampled to the full resolution. Higher is faster but blurrier.
	 *
	 * @type {number}
	 * @default 2
	 */
	get downSample() {

		return this._downSample;

	}

	set downSample( value ) {

		value = Math.min( Math.max( Math.round( value ), 1 ), 4 );

		if ( value === this._downSample ) return;

		this._downSample = value;
		this.setSize( this.width, this.height );

	}

	/**
	 * The prefiltered specular radiance texture. Assign it to `scene.indirectSpecularMap`.
	 * The texture identity is stable across resizes.
	 *
	 * @type {Texture}
	 * @readonly
	 */
	get texture() {

		return this._renderTarget.texture;

	}

	/**
	 * Sets the inputs from a {@link GBufferPass} created with `{ material: true }`, or
	 * compatible textures meeting its requirements. They are required: rendering without
	 * them throws. Caller-owned textures are never resized or disposed by this pass.
	 *
	 * @param {DepthTexture} depthTexture - The depth texture.
	 * @param {Texture} normalTexture - The encoded view-space normal texture.
	 * @param {Texture} materialTexture - The material texture holding roughness in the red channel.
	 */
	setGBuffer( depthTexture, normalTexture, materialTexture ) {

		validateGBufferTextures( depthTexture, normalTexture, 'SSISPass' );

		if ( ! materialTexture?.isTexture ) {

			throw new Error( 'THREE.SSISPass: Expected a material texture, create the GBufferPass with { material: true }.' );

		}

		this.depthTexture = depthTexture;
		this.normalTexture = normalTexture;
		this.materialTexture = materialTexture;

		const uniforms = this._traceMaterial.uniforms;
		uniforms.tDepth.value = depthTexture;
		uniforms.tNormal.value = normalTexture;
		uniforms.tMaterial.value = materialTexture;

	}

	/**
	 * Traces reflections from the lit color in the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - Unused.
	 * @param {WebGLRenderTarget} readBuffer - The lit scene color (linear, before tone mapping).
	 */
	render( renderer, writeBuffer, readBuffer ) {

		if ( this.depthTexture === null ) {

			throw new Error( 'THREE.SSISPass: Call setGBuffer() before rendering.' );

		}

		validateGBuffer( this, renderer );

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

		this._fsQuad.material = this._copyMaterial;
		renderer.setRenderTarget( this._renderTarget );
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

		this.width = width;
		this.height = height;

		const traceWidth = Math.max( Math.ceil( width / this._downSample ), 1 );
		const traceHeight = Math.max( Math.ceil( height / this._downSample ), 1 );

		this._traceTarget.setSize( traceWidth, traceHeight );
		this._renderTarget.setSize( width, height );
		this._traceMaterial.uniforms.resolution.value.set( traceWidth, traceHeight );

	}

	/**
	 * Frees the render targets and materials of this pass.
	 */
	dispose() {

		this._traceTarget.dispose();
		this._renderTarget.dispose();
		this._traceMaterial.dispose();
		this._copyMaterial.dispose();
		this._fsQuad.dispose();

	}

}

export { SSISPass };
