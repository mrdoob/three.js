/**
 * A utility module with basic WebGL 2 capability testing.
 *
 * @hideconstructor
 * @three_import import WebGL from 'three/addons/capabilities/WebGL.js';
 */
class WebGL {

	/**
	 * Returns `true` if WebGL 2 is available.
	 *
	 * @return {boolean} Whether WebGL 2 is available or not.
	 */
	static isWebGL2Available() {

		try {

			const canvas = document.createElement( 'canvas' );
			return !! ( window.WebGL2RenderingContext && canvas.getContext( 'webgl2' ) );

		} catch ( e ) {

			return false;

		}

	}

	/**
	 * Returns `true` if the given color space is available. This method can only be used
	 * if WebGL 2 is supported.
	 *
	 * @param {string} colorSpace - The color space to test.
	 * @return {boolean} Whether the given color space is available or not.
	 */
	static isColorSpaceAvailable( colorSpace ) {

		try {

			const canvas = document.createElement( 'canvas' );
			const ctx = window.WebGL2RenderingContext && canvas.getContext( 'webgl2' );
			ctx.drawingBufferColorSpace = colorSpace;
			return ctx.drawingBufferColorSpace === colorSpace; // deepscan-disable-line SAME_OPERAND_VALUE

		} catch ( e ) {

			return false;

		}

	}

	/**
	 * Returns a `div` element representing a formatted error message that can be appended in
	 * web sites if WebGL 2 isn't supported.
	 *
	 * @return {HTMLDivElement} A `div` element representing a formatted error message that WebGL 2 isn't supported.
	 */
	static getWebGL2ErrorMessage() {

		return this._getErrorMessage( 2 );

	}

	// private

	static _getErrorMessage( version ) {

		const names = {
			1: 'WebGL',
			2: 'WebGL 2'
		};

		const contexts = {
			1: window.WebGLRenderingContext,
			2: window.WebGL2RenderingContext
		};

		let message = 'Your $0 does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">$1</a>';

		const element = document.createElement( 'div' );
		element.id = 'webglmessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.width = '400px';
		element.style.margin = '5em auto 0';

		if ( contexts[ version ] ) {

			message = message.replace( '$0', 'graphics card' );

		} else {

			message = message.replace( '$0', 'browser' );

		}

		message = message.replace( '$1', names[ version ] );

		element.innerHTML = message;

		return element;

	}

}

export default WebGL;
