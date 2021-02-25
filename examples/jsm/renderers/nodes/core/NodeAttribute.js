class NodeAttribute {

	constructor( name, type ) {

		this.name = name;
		this.type = type;

		Object.defineProperty( this, 'isNodeAttribute', { value: true } );

	}

}

export default NodeAttribute;
