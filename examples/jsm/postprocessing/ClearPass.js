import {
	Color
} from 'three';
import { Pass } from './Pass.js';

/**
 * This class can be used to force a clear operation for the current read or
 * default framebuffer (when rendering to screen).
 *
 * ```js
 * const clearPass = new ClearPass();
 * composer.addPass( clearPass );
 * ```
 *
 * @augments Pass
 * @three_import import { ClearPass } from 'three/addons/postprocessing/ClearPass.js';
 */
class ClearPass extends Pass {

	/**
	 * Constructs a new clear pass.
	 *
	 * @param {(number|Color|string)} [clearColor=0x000000] - The clear color.
	 * @param {number} [clearAlpha=0] - The clear alpha.
	 */
	constructor( clearColor = 0x000000, clearAlpha = 0 ) {

		super();

		/**
		 * Overwritten to disable the swap.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsSwap = false;

		/**
		 * The clear color.
		 *
		 * @type {(number|Color|string)}
		 * @default 0x000000
		 */
		this.clearColor = clearColor;

		/**
		 * The clear alpha.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.clearAlpha = clearAlpha;

		// internals

		this._oldClearColor = new Color();

	}

	/**
	 * Performs the clear operation. This affects the current read or the default framebuffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer. This buffer is intended as the rendering
	 * destination for the pass.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer. The pass can access the result from the
	 * previous pass from this buffer.
	 * @param {number} deltaTime - The delta time in seconds.
	 * @param {boolean} maskActive - Whether masking is active or not.
	 */
	render( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {

		let oldClearAlpha;

		if ( this.clearColor ) {

			renderer.getClearColor( this._oldClearColor );
			oldClearAlpha = renderer.getClearAlpha();

			renderer.setClearColor( this.clearColor, this.clearAlpha );

		}

		renderer.setRenderTarget( this.renderToScreen ? null : readBuffer );
		renderer.clear();

		if ( this.clearColor ) {

			renderer.setClearColor( this._oldClearColor, oldClearAlpha );

		}

	}

}

export { ClearPass };
