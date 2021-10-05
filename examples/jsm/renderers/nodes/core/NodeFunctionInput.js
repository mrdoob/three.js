class NodeFunctionInput {

	constructor( type, name, qualifier = '', isConst = false, count = null ) {

		this.type = type;
		this.name = name;
		this.qualifier = qualifier;
		this.isConst = isConst;
		this.count = count;

	}

}

NodeFunctionInput.isNodeFunctionInput = true;

export default NodeFunctionInput;
