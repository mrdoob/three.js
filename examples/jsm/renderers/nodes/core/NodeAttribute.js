class NodeAttribute {

	constructor( name, type ) {

		this.name = name;
		this.type = type;

	}

}

NodeAttribute.prototype.isNodeAttribute = true;

export default NodeAttribute;
