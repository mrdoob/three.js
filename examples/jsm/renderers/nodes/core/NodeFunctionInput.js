class NodeFunctionInput {

	constructor( type, name, qualifier = '', count = null ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.count = count;

	}

	get isCount() {

		return this.count > 0;

	}

}

NodeFunctionInput.isNodeFunctionInput = true;

export default NodeFunctionInput;
