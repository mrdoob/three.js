class NodeFunctionInput {

	constructor( type, name, qualifier = '', isConst = false ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.isConst = isConst;

		Object.defineProperty( this, 'isNodeFunction', { value: true } );

	}

}

export default NodeFunctionInput;
