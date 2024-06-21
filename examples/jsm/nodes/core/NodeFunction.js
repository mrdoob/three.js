class NodeFunction {

	constructor( type, inputs, name = '', precision = '' ) {

		this.type = type;
		this.inputs = inputs;
		this.name = name;
		this.precision = precision;

	}

	getCode( /*name = this.name*/ ) {

		console.warn( 'Abstract function.' );

	}

}

NodeFunction.isNodeFunction = true;

export default NodeFunction;
