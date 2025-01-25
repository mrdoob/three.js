import Node from './Node.js';

/** @module StructTypeNode **/

function getMembersLayout( members ) {

	return Object.entries( members ).map( ( [ name, value ] ) => {

		if ( typeof value === 'string' ) {

			return { name, type: value, atomic: false };

		}

		return { name, type: value.type, atomic: value.atomic || false };

	} );

}

class StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

	constructor( membersLayout ) {

		super( 'struct' );

		this.membersLayout = getMembersLayout( membersLayout );

		this.isStructLayoutNode = true;

	}

	getMemberType( builder, name ) {

		const member = this.membersLayout.find( m => m.name === name );

		return member ? member.type : 'void';

	}

	getNodeType( builder ) {

		const structType = builder.getStructTypeFromNode( this, this.membersLayout );

		return structType.name;

	}

}

export default StructTypeNode;
