if ( window.GPUShaderStage === undefined ) {

	window.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };

}

let isAvailable = false;

if ( navigator.gpu !== undefined ) {

	const adapter = await navigator.gpu.requestAdapter();

	if ( adapter !== null ) {

		isAvailable = true;

	}

}

class WebGPU {

	static isAvailable() {

		return isAvailable;

	}

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
