export default class ComputationRenderer {

	constructor( renderer ) {

		this.renderer = renderer;

	}

	async compute( /* shaderNode, outBuffer, populateTypedArray = true */ ) {

		console.warn( 'Abstract function.' );

	}

}
