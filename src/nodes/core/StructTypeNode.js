import Node from './Node.js';

class StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

	constructor( types ) {

		super();

		this.types = types;
		this.isStructTypeNode = true;

	}

	getMemberTypes() {

		return this.types;

	}

}

export default StructTypeNode;

export const struct = ( members ) => {

	return Object.entries( members ).map( ( [ name, value ] ) => {

		if ( typeof value === 'string' ) {

			return { name, type: value, isAtomic: false };

		}

		return { name, type: value.type, isAtomic: value.atomic || false };

	} );

};
