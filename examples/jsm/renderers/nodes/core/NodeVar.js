class NodeVar {

	constructor( name, type ) {

		this.name = name;
		this.type = type;

	}

}

NodeVar.prototype.isNodeVar = true;

export default NodeVar;
