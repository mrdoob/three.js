class NodeFunctionInput {

	constructor( type, name, count = null, qualifier = '', isConst = false ) {

		this.type = type;
		this.name = name;
		this.count = count;
		this.qualifier = qualifier;
		this.isConst = isConst;

	}

}

NodeFunctionInput.isNodeFunctionInput = true;

export default NodeFunctionInput;
