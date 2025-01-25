import Node from './Node.js';
import StructTypeNode from './StructTypeNode.js';
import { nodeObject } from '../tsl/TSLCore.js';

/** @module StructNode **/

class InternalStructMemberNode extends Node {

	static get type() {

		return 'InternalStructMemberNode';

	}

	constructor( structNode, member ) {

		super( member.type );

		this._structNode = structNode;
		this._member = member;

		this.isStructMemberNode = true;

	}

	get structNode() {

		return this._structNode;

	}

	get member() {

		return this._member;

	}

	generate( builder ) {

		const structName = this.structNode.build( builder );

		return structName + '.' + this.member.name;

	}

}

class StructNode extends Node {

	static get type() {

		return 'StructNode';

	}

	constructor( structLayoutNode, values ) {

		super( 'vec3' );

		this.structLayoutNode = structLayoutNode;
		this.values = values;

		for ( const member of structLayoutNode.membersLayout ) {

			this[ member.name ] = nodeObject( new InternalStructMemberNode( this, member ) );

		}

		this.isStructNode = true;

	}

	getNodeType( builder ) {

		return this.structLayoutNode.getNodeType( builder );

	}

	generate( builder ) {

		const nodeVar = builder.getVarFromNode( this );
		const structType = nodeVar.type;
		const propertyName = builder.getPropertyName( nodeVar );

		builder.addLineFlowCode( `${ propertyName } = ${ builder.generateStruct( structType, this.structLayoutNode.membersLayout, this.values ) }`, this );

		return nodeVar.name;

	}

}

export default StructNode;

export const struct = ( membersLayout ) => {

	const structLayout = new StructTypeNode( membersLayout );

	const struct = ( ...params ) => {

		let values = null;

		if ( params.length > 0 ) {

			if ( params[ 0 ].isNode ) {

				values = {};

				const names = Object.keys( membersLayout );

				for ( let i = 0; i < params.length; i ++ ) {

					values[ names[ i ] ] = params[ i ];

				}

			} else {

				values = params[ 0 ];

			}

		}

		return nodeObject( new StructNode( structLayout, values ) );

	};

	return struct;

};
