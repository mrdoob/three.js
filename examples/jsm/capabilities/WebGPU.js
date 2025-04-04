let isAvailable = ( typeof navigator !== 'undefined' && navigator.gpu !== undefined );

if ( typeof window !== 'undefined' && isAvailable ) {

	isAvailable = await navigator.gpu.requestAdapter();

}

/**
 * A utility module with basic WebGPU capability testing.
 *
 * @hideconstructor
 */
class WebGPU {

	/**
	 * Returns `true` if WebGPU is available.
	 *
	 * @return {boolean} Whether WebGPU is available or not.
	 */
	static isAvailable() {

		return Boolean( isAvailable );

	}

	/**
	 * Returns a `div` element representing a formatted error message that can be appended in
	 * web sites if WebGPU isn't supported.
	 *
	 * @return {HTMLDivElement} A `div` element representing a formatted error message that WebGPU isn't supported.
	 */
	static getErrorMessage() {

		const message = 'Your browser does not support <a href="https://gpuweb.github.io/gpuweb/" style="color:blue">WebGPU</a> yet';

		const element = document.createElement( 'div' );
		element.id = 'webgpumessage';
		element.style.fontFamily = 'monospace';
		element.style.fontSize = '13px';
		element.style.fontWeight = 'normal';
		element.style.textAlign = 'center';
		element.style.background = '#fff';
		element.style.color = '#000';
		element.style.padding = '1.5em';
		element.style.maxWidth = '400px';
		element.style.margin = '5em auto 0';

		element.innerHTML = message;

		return element;

	}

}


export default WebGPU;
