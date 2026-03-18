import {
	ColorManagement,
	RawShaderMaterial,
	UniformsUtils,
	LinearToneMapping,
	ReinhardToneMapping,
	CineonToneMapping,
	AgXToneMapping,
	ACESFilmicToneMapping,
	NeutralToneMapping,
	CustomToneMapping,
	SRGBTransfer
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { OutputShader } from '../shaders/OutputShader.js';

/**
 * This pass is responsible for including tone mapping and color space conversion
 * into your pass chain. In most cases, this pass should be included at the end
 * of each pass chain. If a pass requires sRGB input (e.g. like FXAA), the pass
 * must follow `OutputPass` in the pass chain.
 *
 * The tone mapping and color space settings are extracted from the renderer.
 *
 * ```js
 * const outputPass = new OutputPass();
 * composer.addPass( outputPass );
 * ```
 *
 * @augments Pass
 * @three_import import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
 */
class OutputPass extends Pass {

	/**
	 * Constructs a new output pass.
	 */
	constructor() {

		super();

		/**
		 * This flag indicates that this is an output pass.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isOutputPass = true;

		/**
		 * The pass uniforms.
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( OutputShader.uniforms );

		/**
		 * The pass material.
		 *
		 * @type {RawShaderMaterial}
		 */
		this.material = new RawShaderMaterial( {
			name: OutputShader.name,
			uniforms: this.uniforms,
			vertexShader: OutputShader.vertexShader,
			fragmentShader: OutputShader.fragmentShader
		} );

		// internals

		this._fsQuad = new FullScreenQuad( this.material );

		this._outputColorSpace = null;
		this._toneMapping = null;

	}

	/**
	 * Performs the output pass.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer/*, deltaTime, maskActive */ ) {

		this.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
		this.uniforms[ 'toneMappingExposure' ].value = renderer.toneMappingExposure;

		// rebuild defines if required

		if ( this._outputColorSpace !== renderer.outputColorSpace || this._toneMapping !== renderer.toneMapping ) {

			this._outputColorSpace = renderer.outputColorSpace;
			this._toneMapping = renderer.toneMapping;

			this.material.defines = {};

			if ( ColorManagement.getTransfer( this._outputColorSpace ) === SRGBTransfer ) this.material.defines.SRGB_TRANSFER = '';

			if ( this._toneMapping === LinearToneMapping ) this.material.defines.LINEAR_TONE_MAPPING = '';
			else if ( this._toneMapping === ReinhardToneMapping ) this.material.defines.REINHARD_TONE_MAPPING = '';
			else if ( this._toneMapping === CineonToneMapping ) this.material.defines.CINEON_TONE_MAPPING = '';
			else if ( this._toneMapping === ACESFilmicToneMapping ) this.material.defines.ACES_FILMIC_TONE_MAPPING = '';
			else if ( this._toneMapping === AgXToneMapping ) this.material.defines.AGX_TONE_MAPPING = '';
			else if ( this._toneMapping === NeutralToneMapping ) this.material.defines.NEUTRAL_TONE_MAPPING = '';
			else if ( this._toneMapping === CustomToneMapping ) this.material.defines.CUSTOM_TONE_MAPPING = '';

			this.material.needsUpdate = true;

		}

		//

		if ( this.renderToScreen === true ) {

			renderer.setRenderTarget( null );
			this._fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			this._fsQuad.render( renderer );

		}

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.material.dispose();
		this._fsQuad.dispose();

	}

}

export { OutputPass };
