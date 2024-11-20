class WebGPUAsync {

	static _adapter = null;

	static async isAvailable() {

		return !! await this.getStaticAdapter();

	}

	static async getStaticAdapter() {

		try {

			if( this._adapter == null ) {

				this._adapter = await navigator.gpu.requestAdapter();

			}

		} catch ( e ) {

			return null;
		}

		return this._adapter;
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

export default WebGPUAsync;
