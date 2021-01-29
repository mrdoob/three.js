class NodeVary {

	constructor( name, type, value ) {

		this.name = name;
		this.type = type;
		this.value = value;

		Object.defineProperty( this, 'isNodeVary', { value: true } );

	}

}

export default NodeVary;
