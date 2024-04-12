if ( self.GPUShaderStage === undefined ) {

	self.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };

}

let isAvailable = navigator.gpu !== undefined;

class WebGPU {

	static isAvailable() {

		return isAvailable;

	}

	static async getStaticAdapter () {

		if ( navigator.gpu ) {

			const adapter = await navigator.gpu.requestAdapter();

			if ( !adapter ) {

				isAvailable = false;

			}

			return adapter;

		}

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
