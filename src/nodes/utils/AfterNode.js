import Node from '../core/Node.js';
import { nodeProxy, addNodeElement } from '../shadernode/ShaderNode.js';

class AfterNode extends Node {

	constructor( node, afterNode ) {

		super( 'void' );

		this.node = node;
		this.afterNode = afterNode;

	}

	getNodeType( builder ) {

		return this.afterNode.getNodeType( builder );

	}

	setup( builder ) {

		this.node.build( builder );

		return this.afterNode;

	}

}

export const after = nodeProxy( AfterNode );
export const before = ( node, afterNode ) => after( afterNode, node );

addNodeElement( 'after', after );
addNodeElement( 'before', before );

export default AfterNode;

