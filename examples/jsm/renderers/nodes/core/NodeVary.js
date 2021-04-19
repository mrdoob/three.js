class NodeVary {

	constructor( name, type, snippet = '' ) {

		this.name = name;
		this.type = type;
		this.snippet = snippet;

	}

}

NodeVary.prototype.isNodeVary = true;

export default NodeVary;
