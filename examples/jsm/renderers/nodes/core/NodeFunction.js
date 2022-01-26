class NodeFunction {

	constructor() {

		this.type = '';
		this.inputs = [];
		this.inputsCode = '';
		this.blockCode = '';
		this.presicion = '';
		this.headerCode = '';

	}

	set( type, inputs, blockCode, name = '', presicion = '', headerCode = '' ) {

		this.type = type;
		this.inputs = inputs;
		this.name = name;
		this.presicion = presicion;

		// this.inputsCode = inputs.;
		this.blockCode = blockCode;
		this.headerCode = headerCode;

		return this;

	}

	getCode( /*name = this.name*/ ) {

		console.warn( 'Abstract function.' );

	}

}

NodeFunction.isNodeFunction = true;

export default NodeFunction;
