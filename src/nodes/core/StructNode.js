import Node from './Node.js';
import StructTypeNode from './StructTypeNode.js';
import { nodeObject } from '../tsl/TSLCore.js';

/** @module StructNode **/

class StructNode extends Node {

	static get type() {

		return 'StructNode';

	}

	constructor( structLayoutNode, values ) {

		super( 'vec3' );

		this.structLayoutNode = structLayoutNode;
		this.values = values;

		this.isStructNode = true;

	}

	getNodeType( builder ) {

		return this.structLayoutNode.getNodeType( builder );

	}

	getMemberType( builder, name ) {

		return this.structLayoutNode.getMemberType( builder, name );

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
