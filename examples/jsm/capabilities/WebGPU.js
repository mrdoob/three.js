if ( self.GPUShaderStage === undefined ) {

	self.GPUShaderStage = { VERTEX: 1, FRAGMENT: 2, COMPUTE: 4 };

}

class WebGPU {

	static async checkAvailability() {

		if ( navigator.gpu ) {

			const adapter = await navigator.gpu.requestAdapter();
			return adapter !== null;

		}

		return false;

	}

	static async isAvailable() {

		if ( this._isAvailablePromise === undefined ) {

			this._isAvailablePromise = WebGPU.checkAvailability();

		}

		return await this._isAvailablePromise;

	}


	static async requestStaticAdapter() {

		if ( navigator.gpu ) {

			return await navigator.gpu.requestAdapter();

		}

		return false;

	}

	static async getStaticAdapter() {

		if ( this._adapterPromise === undefined ) {

			this._adapterPromise = WebGPU.requestStaticAdapter();

		}

		return await this._adapterPromise;

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

// Initialize static properties.

WebGPU.isAvailable();
WebGPU.getStaticAdapter();

export default WebGPU;
