import Node from './Node.js';
import AssignNode from './AssignNode.js';
import BypassNode from '../core/BypassNode.js';
import ExpressionNode from '../core/ExpressionNode.js';

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

		this.nodes.push( new BypassNode( new ExpressionNode(), node ) );

		return this;

	}

	assign( targetNode, sourceValue ) {

		return this.add( new AssignNode( targetNode, sourceValue ) );

	}

	build( builder, ...params ) {

		for ( const node of this.nodes ) {

			node.build( builder );

		}

		const outputNode = this.outputNode && ( this.outputNode.uuid !== this.uuid ) ? this.outputNode : this.nodes[ this.nodes.length - 1 ].callNode;

		return outputNode ? outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

}

export default StackNode;
