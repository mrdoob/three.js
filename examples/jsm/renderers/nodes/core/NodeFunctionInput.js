class NodeFunctionInput {

	constructor( type, name, qualifier = '', isConst = false, count = 0 ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.isConst = isConst;
		this.count = count;

		Object.defineProperty( this, 'isNodeFunction', { value: true } );

	}

}

export default NodeFunctionInput;
