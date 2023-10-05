import Node, { addNodeClass } from '../core/Node.js';
import AssignNode from '../core/AssignNode.js';

class ArrayElementNode extends Node { // @TODO: If extending from TempNode it breaks webgpu_compute

	constructor( node, indexNode ) {

		super();

		this.node = node;
		this.indexNode = indexNode;

		this.isArrayElementNode = true;

	}

	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	assign( node ) {

		this.node = this.node.temp();
		return this.node.bypass( new AssignNode( this, node ) );

	}

	generate( builder ) {

		const nodeSnippet = this.node.build( builder );
		const indexSnippet = this.indexNode.build( builder, 'uint' );

		return `${nodeSnippet}[ ${indexSnippet} ]`;

	}

}

export default ArrayElementNode;

addNodeClass( 'ArrayElementNode', ArrayElementNode );
