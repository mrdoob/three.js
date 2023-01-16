import Node from './Node.js';
import AssignNode from './AssignNode.js';
import BypassNode from '../core/BypassNode.js';

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

		this.nodes.push( new BypassNode( node ) );

		return this;

	}

	assign( targetNode, sourceValue ) {

		return this.add( new AssignNode( targetNode, sourceValue ) );

	}

	build( builder, ...params ) {

		let outputNode = this.outputNode;

		if ( ( ! outputNode || ( this.outputNode.uuid === this.uuid ) ) && this.nodes.length ) { // Make last node the output node

			outputNode = this.nodes[ this.nodes.length - 1 ].callNode;

		}

		for ( const node of this.nodes ) {

			if ( node.callNode !== outputNode ) node.build( builder );

		}

		return outputNode ? outputNode.build( builder, ...params ) : super.build( builder, ...params );

	}

}

export default StackNode;
