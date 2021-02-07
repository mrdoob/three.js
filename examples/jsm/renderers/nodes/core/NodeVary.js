class NodeVary {

	constructor( name, type, snippet = '' ) {

		this.name = name;
		this.type = type;
		this.snippet = snippet;

		Object.defineProperty( this, 'isNodeVary', { value: true } );

	}

}

export default NodeVary;
