import {
	HalfFloatType,
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from './Pass.js';
import { CopyShader } from '../shaders/CopyShader.js';

/**
 * A pass that saves the contents of the current read buffer in a render target.
 *
 * ```js
 * const savePass = new SavePass( customRenderTarget );
 * composer.addPass( savePass );
 * ```
 *
 * @augments Pass
 * @three_import import { SavePass } from 'three/addons/postprocessing/SavePass.js';
 */
class SavePass extends Pass {

	/**
	 * Constructs a new save pass.
	 *
	 * @param {WebGLRenderTarget} [renderTarget] - The render target for saving the read buffer.
	 * If not provided, the pass automatically creates a render target.
	 */
	constructor( renderTarget ) {

		super();

		/**
		 * The pass uniforms.
		 *
		 * @type {Object}
		 */
		this.uniforms = UniformsUtils.clone( CopyShader.uniforms );

		/**
		 * The pass material.
		 *
		 * @type {ShaderMaterial}
		 */
		this.material = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: CopyShader.vertexShader,
			fragmentShader: CopyShader.fragmentShader,
			blending: NoBlending

		} );

		/**
		 * The render target which is used to save the read buffer.
		 *
		 * @type {WebGLRenderTarget}
		 */
		this.renderTarget = renderTarget;

		if ( this.renderTarget === undefined ) {

			this.renderTarget = new WebGLRenderTarget( 1, 1, { type: HalfFloatType } ); // will be resized later
			this.renderTarget.texture.name = 'SavePass.rt';

		}

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		// internals

		this._fsQuad = new FullScreenQuad( this.material );

	}

	/**
	 * Performs the save pass.
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

		renderer.setRenderTarget( this.renderTarget );
		if ( this.clear ) renderer.clear();
		this._fsQuad.render( renderer );

	}

	/**
	 * Sets the size of the pass.
	 *
	 * @param {number} width - The width to set.
	 * @param {number} height - The width to set.
	 */
	setSize( width, height ) {

		this.renderTarget.setSize( width, height );

	}

	/**
	 * Frees the GPU-related resources allocated by this instance. Call this
	 * method whenever the pass is no longer used in your app.
	 */
	dispose() {

		this.renderTarget.dispose();

		this.material.dispose();

		this._fsQuad.dispose();

	}

}

export { SavePass };
