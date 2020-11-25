class NodeUniform {

	constructor( name, type, node, needsUpdate = undefined ) {

		this.name = name;
		this.type = type;
		this.node = node;
		this.needsUpdate = needsUpdate;

	}

	get value() {

		return this.node.value;

	}

	set value( val ) {

		this.node.value = val;

	}

}

export default NodeUniform;
