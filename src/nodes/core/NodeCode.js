class NodeCode {

	constructor( name, type, code = '' ) {

		this.name = name;
		this.type = type;
		this.code = code;

		Object.defineProperty( this, 'isNodeCode', { value: true } );

	}

}

export default NodeCode;
