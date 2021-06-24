class NodeUniform {

	constructor( params = {} ) {

		this.name = params.name;
		this.type = params.type;
		this.node = params.node;
		this.needsUpdate = params.needsUpdate;

	}

	get value() {

		return this.node.value;

	}

	set value( val ) {

		this.node.value = val;

	}

}

export { NodeUniform };
