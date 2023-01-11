export default class ComputationRenderer {

	constructor( renderer ) {

		this.renderer = renderer;

		this._buffers = [];

	}

	createBuffer( /* ...params */ ) {

		console.warn( 'Abstract function.' );
		// this._buffers.push( buffer );

	}

	async compute( /* shaderNode, outBuffer, populateTypedArray = true */ ) {

		console.warn( 'Abstract function.' );

	}

	disposeBuffers() {

		this._buffers.forEach( buffer => buffer.dispose() );

	}

}