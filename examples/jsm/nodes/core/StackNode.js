import Node, { addNodeClass } from './Node.js';
import { assign } from '../math/OperatorNode.js';
import { bypass } from '../core/BypassNode.js';
import { expression } from '../core/ExpressionNode.js';
import { nodeProxy } from '../shadernode/ShaderNode.js';

class StackNode extends Node {

	constructor() {

		super();

		this.nodes = [];
		this.outputNode = null;

		this.isStackNode = true;

	}

	getNodeType( builder ) {

		return this.outputNode ? this.outputNode.getNodeType( builder ) : 'void';

	}

	add( node ) {

		this.nodes.push( bypass( expression(), node ) );

		return this;

	}

	assign( targetNode, sourceValue ) {

		return this.add( assign( targetNode, sourceValue ) );

	}

	build( builder, ...params ) {

		for ( const node of this.nodes ) {

			node.build( builder );

		}

		return this.outputNode ? this.outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

}

export default StackNode;

export const stack = nodeProxy( StackNode );

addNodeClass( StackNode );
