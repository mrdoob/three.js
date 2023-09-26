import Node, { addNodeClass } from './Node.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

class VarNode extends Node {

	constructor( node, name = null ) {

		super();

		this.node = node;
		this.name = name;

	}

	assign( node ) {

		node.traverse( ( childNode, replaceNode ) => {

			if ( replaceNode && childNode.uuid === this.uuid ) {

				replaceNode( this.node );

			}

		} );
		this.node = node;
		return this;

	}

	isGlobal() {

		return true;

	}

	getHash( builder ) {

		return this.name || super.getHash( builder );

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	generate( builder ) {

		const node = this.node;
		const name = this.name;

		if ( name === null && node.isTempNode === true ) {

			return node.build( builder );

		}

		const type = builder.getVectorType( this.getNodeType( builder ) );

		const snippet = node.build( builder, type );
		const nodeVar = builder.getVarFromNode( this, type );

		if ( name !== null ) {

			nodeVar.name = name;

		}

		const propertyName = builder.getPropertyName( nodeVar );

		builder.addLineFlowCode( `${propertyName} = ${snippet}` );

		return propertyName;

	}

}

export default VarNode;

export const temp = nodeProxy( VarNode );

addNodeElement( 'temp', temp );

addNodeClass( 'VarNode', VarNode );
