class NodeVar {

	constructor( name, type, snippet = '' ) {

		this.name = name;
		this.type = type;
		this.snippet = snippet;

		Object.defineProperty( this, 'isNodeVar', { value: true } );

	}

}

export default NodeVar;
