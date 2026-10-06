import {
	AddEquation,
	Color,
	CustomBlending,
	DstAlphaFactor,
	DstColorFactor,
	HalfFloatType,
	MeshNormalMaterial,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	Vector2,
	WebGLRenderTarget,
	ZeroFactor
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { setGBuffer, validateGBuffer, validateGBufferTextures, updatePerspectiveCamera } from './GBufferUtils.js';
import { SAOShader } from '../shaders/SAOShader.js';
import { BlurShaderUtils, DepthLimitedBlurShader } from '../shaders/DepthLimitedBlurShader.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * A SAO implementation inspired from @bhouston previous SAO work.
 *
 * `SAOPass` provides better quality than {@link SSAOPass} but is also more expensive.
 *
 * ```js
 * const saoPass = new SAOPass( scene, camera );
 * composer.addPass( saoPass );
 * ```
 *
 * @augments Pass
 * @three_import import { SAOPass } from 'three/addons/postprocessing/SAOPass.js';
 */
class SAOPass extends Pass {

	/**
	 * Constructs a new SAO pass.
	 *
	 * @param {Scene} scene - The scene to compute the AO for.
	 * @param {Camera} camera - The camera.
	 * @param {Vector2} [resolution] - The effect's resolution.
	 * @param {Object} [parameters] - Optional external depthTexture and normalTexture inputs.
	 */
	constructor( scene, camera, resolution = new Vector2( 256, 256 ), parameters = {} ) {

		super();

		/**
		 * The scene to render the AO for.
		 *
		 * @type {Scene}
		 */
		this.scene = scene;

		/**
		 * The camera.
		 *
		 * @type {Camera}
		 */
		this.camera = camera;

		/**
		 * Overwritten to perform a clear operation by default.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.clear = true;

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		this._originalClearColor = new Color();
		this._oldClearColor = new Color();
		this._oldClearAlpha = 1;

		/**
		 * The SAO parameter.
		 *
		 * @type {Object}
		 */
		this.params = {
			output: 0,
			saoBias: 0.5,
			saoIntensity: 0.18,
			saoScale: 1,
			saoKernelRadius: 100,
			saoMinResolution: 0,
			saoBlur: true,
			saoBlurRadius: 8,
			saoBlurStdDev: 4,
			saoBlurDepthCutoff: 0.01
		};

		/**
		 * The effect's resolution.
		 *
		 * @type {Vector2}
		 * @default (256,256)
		 */
		this.resolution = new Vector2( resolution.x, resolution.y );
		this.width = resolution.x;
		this.height = resolution.y;

		this.saoRenderTarget = new WebGLRenderTarget( this.resolution.x, this.resolution.y, { type: HalfFloatType, depthBuffer: false } );
		this.blurIntermediateRenderTarget = this.saoRenderTarget.clone();

		this.normalMaterial = new MeshNormalMaterial();
		this.normalMaterial.blending = NoBlending;

		this.saoMaterial = new ShaderMaterial( {
			defines: Object.assign( {}, SAOShader.defines ),
			fragmentShader: SAOShader.fragmentShader,
			vertexShader: SAOShader.vertexShader,
			uniforms: UniformsUtils.clone( SAOShader.uniforms )
		} );
		this.saoMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.saoMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.saoMaterial.blending = NoBlending;

		this.vBlurMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( DepthLimitedBlurShader.uniforms ),
			defines: Object.assign( {}, DepthLimitedBlurShader.defines ),
			vertexShader: DepthLimitedBlurShader.vertexShader,
			fragmentShader: DepthLimitedBlurShader.fragmentShader
		} );
		this.vBlurMaterial.defines[ 'DEPTH_PACKING' ] = 0;
		this.vBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.vBlurMaterial.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
		this.vBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.vBlurMaterial.blending = NoBlending;

		this.hBlurMaterial = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( DepthLimitedBlurShader.uniforms ),
			defines: Object.assign( {}, DepthLimitedBlurShader.defines ),
			vertexShader: DepthLimitedBlurShader.vertexShader,
			fragmentShader: DepthLimitedBlurShader.fragmentShader
		} );
		this.hBlurMaterial.defines[ 'DEPTH_PACKING' ] = 0;
		this.hBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
		this.hBlurMaterial.uniforms[ 'tDiffuse' ].value = this.blurIntermediateRenderTarget.texture;
		this.hBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
		this.hBlurMaterial.blending = NoBlending;

		this.materialCopy = new ShaderMaterial( {
			uniforms: UniformsUtils.clone( CopyShader.uniforms ),
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending
		} );
		this.materialCopy.transparent = true;
		this.materialCopy.depthTest = false;
		this.materialCopy.depthWrite = false;
		this.materialCopy.blending = CustomBlending;
		this.materialCopy.blendSrc = DstColorFactor;
		this.materialCopy.blendDst = ZeroFactor;
		this.materialCopy.blendEquation = AddEquation;
		this.materialCopy.blendSrcAlpha = DstAlphaFactor;
		this.materialCopy.blendDstAlpha = ZeroFactor;
		this.materialCopy.blendEquationAlpha = AddEquation;

		this.fsQuad = new FullScreenQuad( null );
		this.setGBuffer( parameters.depthTexture, parameters.normalTexture );

	}

	/**
	 * Configures shared geometry inputs. Call without arguments to restore internal rendering.
	 * Both textures must describe the same surfaces, frame, camera and projection as this pass.
	 * Normals are unit view-space vectors encoded as RGB = normal * 0.5 + 0.5, with
	 * NoColorSpace. Depth is a separate DepthTexture sampled from red, with near = 0
	 * and far/background = 1. Reversed and logarithmic depth are not supported.
	 * Inputs must match the pass width/height in physical pixels, use nearest filtering,
	 * clamp-to-edge wrapping and no mipmaps. The caller renders, resizes and disposes them.
	 *
	 * @param {DepthTexture} [depthTexture] - External depth texture.
	 * @param {Texture} [normalTexture] - External encoded view-space normal texture.
	 */
	setGBuffer( depthTexture, normalTexture ) {

		validateGBufferTextures( depthTexture, normalTexture, 'SAOPass' );
		setGBuffer( this, depthTexture, normalTexture );

		this.saoMaterial.uniforms[ 'tDepth' ].value = this.depthTexture;
		this.saoMaterial.uniforms[ 'tNormal' ].value = this.normalTexture;
		this.vBlurMaterial.uniforms[ 'tDepth' ].value = this.depthTexture;
		this.hBlurMaterial.uniforms[ 'tDepth' ].value = this.depthTexture;

	}

	/**
	 * Performs the SAO pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive*/ ) {

		updatePerspectiveCamera( this.saoMaterial, this.camera );
		updatePerspectiveCamera( this.vBlurMaterial, this.camera );
		updatePerspectiveCamera( this.hBlurMaterial, this.camera );
		validateGBuffer( this, renderer );

		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );

		// Rendering readBuffer first when rendering to screen
		if ( this.renderToScreen ) {

			this.materialCopy.blending = NoBlending;
			this.materialCopy.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.materialCopy.needsUpdate = true;
			this._renderPass( renderer, this.materialCopy, null );

		}

		renderer.getClearColor( this._oldClearColor );
		this._oldClearAlpha = renderer.getClearAlpha();
		const oldAutoClear = renderer.autoClear;
		renderer.autoClear = false;

		this.saoMaterial.uniforms[ 'bias' ].value = this.params.saoBias;
		this.saoMaterial.uniforms[ 'intensity' ].value = this.params.saoIntensity;
		this.saoMaterial.uniforms[ 'scale' ].value = this.params.saoScale;
		this.saoMaterial.uniforms[ 'kernelRadius' ].value = this.params.saoKernelRadius;
		this.saoMaterial.uniforms[ 'minResolution' ].value = this.params.saoMinResolution;
		this.saoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.saoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		// this.saoMaterial.uniforms['randomSeed'].value = Math.random();

		const depthCutoff = this.params.saoBlurDepthCutoff * ( this.camera.far - this.camera.near );
		this.vBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;
		this.hBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;

		this.vBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.vBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
		this.hBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
		this.hBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;

		this.params.saoBlurRadius = Math.floor( this.params.saoBlurRadius );
		if ( ( this.prevStdDev !== this.params.saoBlurStdDev ) || ( this.prevNumSamples !== this.params.saoBlurRadius ) ) {

			BlurShaderUtils.configure( this.vBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new Vector2( 0, 1 ) );
			BlurShaderUtils.configure( this.hBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new Vector2( 1, 0 ) );
			this.prevStdDev = this.params.saoBlurStdDev;
			this.prevNumSamples = this.params.saoBlurRadius;

		}

		// render normal and depth
		if ( this._renderGBuffer ) this._renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );

		// Rendering SAO texture
		this._renderPass( renderer, this.saoMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		// Blurring SAO texture
		if ( this.params.saoBlur ) {

			this._renderPass( renderer, this.vBlurMaterial, this.blurIntermediateRenderTarget, 0xffffff, 1.0 );
			this._renderPass( renderer, this.hBlurMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

		}

		const outputMaterial = this.materialCopy;

		// Setting up SAO rendering
		if ( this.params.output === SAOPass.OUTPUT.Normal ) {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.normalTexture;
			this.materialCopy.needsUpdate = true;

		} else {

			this.materialCopy.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
			this.materialCopy.needsUpdate = true;

		}

		// Blending depends on output
		if ( this.params.output === SAOPass.OUTPUT.Default ) {

			outputMaterial.blending = CustomBlending;

		} else {

			outputMaterial.blending = NoBlending;

		}

		// Rendering SAOPass result on top of previous pass
		this._renderPass( renderer, outputMaterial, this.renderToScreen ? null : readBuffer );

		renderer.setClearColor( this._oldClearColor, this._oldClearAlpha );
		renderer.autoClear = oldAutoClear;

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The height to set.
	 */
	setSize( width, height ) {

		this.width = width;
		this.height = height;
		this.resolution.set( width, height );

		this.saoRenderTarget.setSize( width, height );
		this.blurIntermediateRenderTarget.setSize( width, height );
		if ( this.normalRenderTarget ) this.normalRenderTarget.setSize( width, height );

		this.saoMaterial.uniforms[ 'size' ].value.set( width, height );
		this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
		this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value.copy( this.camera.projectionMatrix );
		this.saoMaterial.needsUpdate = true;

		this.vBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.vBlurMaterial.needsUpdate = true;

		this.hBlurMaterial.uniforms[ 'size' ].value.set( width, height );
		this.hBlurMaterial.needsUpdate = true;

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.saoRenderTarget.dispose();
		this.blurIntermediateRenderTarget.dispose();
		if ( this.normalRenderTarget ) this.normalRenderTarget.dispose();

		this.normalMaterial.dispose();
		this.saoMaterial.dispose();
		this.vBlurMaterial.dispose();
		this.hBlurMaterial.dispose();
		this.materialCopy.dispose();

		this.fsQuad.dispose();

	}

	// internal

	_renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

		// save original state
		renderer.getClearColor( this._originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );

		// setup pass state
		renderer.autoClear = false;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.fsQuad.material = passMaterial;
		this.fsQuad.render( renderer );

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this._originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

	_renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

		renderer.getClearColor( this._originalClearColor );
		const originalClearAlpha = renderer.getClearAlpha();
		const originalAutoClear = renderer.autoClear;

		renderer.setRenderTarget( renderTarget );
		renderer.autoClear = false;

		clearColor = overrideMaterial.clearColor || clearColor;
		clearAlpha = overrideMaterial.clearAlpha || clearAlpha;
		if ( ( clearColor !== undefined ) && ( clearColor !== null ) ) {

			renderer.setClearColor( clearColor );
			renderer.setClearAlpha( clearAlpha || 0.0 );
			renderer.clear();

		}

		this.scene.overrideMaterial = overrideMaterial;
		renderer.render( this.scene, this.camera );
		this.scene.overrideMaterial = null;

		// restore original state
		renderer.autoClear = originalAutoClear;
		renderer.setClearColor( this._originalClearColor );
		renderer.setClearAlpha( originalClearAlpha );

	}

}

SAOPass.OUTPUT = {
	'Default': 0,
	'SAO': 1,
	'Normal': 2
};

export { SAOPass };
