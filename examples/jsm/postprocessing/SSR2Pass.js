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
import { SSR2TraceShader, SSR2ResolveShader } from '../shaders/SSR2Shader.js';

/**
 * Screen-space reflections computed as prefiltered incoming specular radiance, meant to
 * be consumed by the material lighting through {@link Scene#indirectSpecularMap}
 * instead of being composited over the beauty image.
 *
 * Each pixel traces one mirror ray through the depth buffer. A hit returns the lit scene
 * color; a miss (or the screen border) fades to the scene's PMREM environment sampled at
 * the surface roughness. A mip chain of the result is then sampled at a per-pixel level
 * chosen from the roughness. Materials apply their own BRDF to the result.
 *
 * Inputs come from a {@link GBufferPass} created with `{ material: true }`. Place this
 * pass after the pass that renders the lit scene, and assign {@link SSR2Pass#texture} to
 * `scene.indirectSpecularMap` once. The pass reads the lit color of the current frame
 * and the scene consumes the result on the next frame, so reflections lag by one
 * frame under motion and the first frame has no specular. The lit color already contains
 * the previous reflections, which gives free multiple bounces.
 *
 * Perspective cameras only. The environment is `scene.environment` and must be a PMREM
 * texture (see {@link PMREMGenerator}); its rotation is ignored.
 *
 * ```js
 * const gBufferPass = new GBufferPass( scene, camera, width, height, { material: true } );
 * const ssr2Pass = new SSR2Pass( scene, camera, width, height, gBufferPass );
 * scene.indirectSpecularMap = ssr2Pass.texture;
 * composer.addPass( gBufferPass );
 * composer.addPass( new RenderPass( scene, camera ) );
 * composer.addPass( ssr2Pass );
 * ```
 *
 * @augments Pass
 * @three_import import { SSR2Pass } from 'three/addons/postprocessing/SSR2Pass.js';
 */
class SSR2Pass extends Pass {

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
		 * @default 0.1
		 */
		this.thickness = 0.1;

		/**
		 * Surfaces rougher than this skip the ray march and use the environment only.
		 *
		 * @type {number}
		 * @default 0.5
		 */
		this.maxRoughness = 0.5;

		/**
		 * Width in UV units over which hits fade to the environment near the screen border.
		 *
		 * @type {number}
		 * @default 0.2
		 */
		this.screenEdgeFade = 0.2;

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
			defines: Object.assign( {}, SSR2TraceShader.defines ),
			uniforms: UniformsUtils.clone( SSR2TraceShader.uniforms ),
			vertexShader: SSR2TraceShader.vertexShader,
			fragmentShader: SSR2TraceShader.fragmentShader,
			blending: NoBlending
		} );

		this._resolveMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( SSR2ResolveShader.uniforms ),
			vertexShader: SSR2ResolveShader.vertexShader,
			fragmentShader: SSR2ResolveShader.fragmentShader,
			blending: NoBlending
		} );

		this._traceMaterial.uniforms.tDepth.value = gBufferPass.depthTexture;
		this._traceMaterial.uniforms.tNormal.value = gBufferPass.normalTexture;
		this._traceMaterial.uniforms.tMaterial.value = gBufferPass.materialTexture;
		this._resolveMaterial.uniforms.tRadiance.value = this._traceTarget.texture;
		this._resolveMaterial.uniforms.tMaterial.value = gBufferPass.materialTexture;

		this._fsQuad = new FullScreenQuad( null );
		this._environment = null;

		this.setSize( width, height );

	}

	/**
	 * The prefiltered specular radiance texture. Assign it to `scene.indirectSpecularMap`.
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
		uniforms.maxRoughness.value = this.maxRoughness;
		uniforms.screenEdgeFade.value = this.screenEdgeFade;

		const target = renderer.getRenderTarget();

		this._fsQuad.material = this._traceMaterial;
		renderer.setRenderTarget( this._traceTarget );
		this._fsQuad.render( renderer );

		this._fsQuad.material = this._resolveMaterial;
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

		this._traceTarget.setSize( width, height );
		this._resolveTarget.setSize( width, height );

		this._traceMaterial.defines.MAX_STEP = Math.ceil( Math.sqrt( width * width + height * height ) );
		this._traceMaterial.needsUpdate = true;
		this._traceMaterial.uniforms.resolution.value.set( width, height );
		this._resolveMaterial.uniforms.maxMip.value = Math.floor( Math.log2( Math.max( width, height ) ) );

	}

	/**
	 * Frees the render targets and materials of this pass.
	 */
	dispose() {

		this._traceTarget.dispose();
		this._resolveTarget.dispose();
		this._traceMaterial.dispose();
		this._resolveMaterial.dispose();
		this._fsQuad.dispose();

	}

}

export { SSR2Pass };
