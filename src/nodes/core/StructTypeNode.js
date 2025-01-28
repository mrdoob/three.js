import Node from './Node.js';
import { getLengthFromType } from './NodeUtils.js';

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

	constructor( membersLayout, name = null ) {

		super( 'struct' );

		this.membersLayout = getMembersLayout( membersLayout );
		this.name = name;

		this.isStructLayoutNode = true;

	}

	getLength() {

		let length = 0;

		for ( const member of this.membersLayout ) {

			length += getLengthFromType( member.type );

		}

		return length;

	}

	getMemberType( builder, name ) {

		const member = this.membersLayout.find( m => m.name === name );

		return member ? member.type : 'void';

	}

	getNodeType( builder ) {

		const structType = builder.getStructTypeFromNode( this, this.membersLayout, this.name );

		return structType.name;

	}

	generate( builder ) {

		return this.getNodeType( builder );

	}

}

export default StructTypeNode;
