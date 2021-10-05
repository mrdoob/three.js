class NodeVar {

	constructor( name, type ) {

		this.name = name;
		this.type = type;

		Object.defineProperty( this, 'isNodeVar', { value: true } );

	}

}

export default NodeVar;
