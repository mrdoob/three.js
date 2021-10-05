import TempNode from '../core/TempNode.js';
import ContextNode from '../core/ContextNode.js';

class CondNode extends TempNode {

	constructor( node, ifNode, elseNode ) {

		super();

		this.node = node;

		this.ifNode = ifNode;
		this.elseNode = elseNode;

	}

	getNodeType( builder ) {

		const ifType = this.ifNode.getNodeType( builder );
		const elseType = this.elseNode.getNodeType( builder );

		if ( builder.getTypeLength( elseType ) > builder.getTypeLength( ifType ) ) {

			return elseType;

		}

		return ifType;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );

		const context = { cache: false };

		const nodeSnippet = this.node.build( builder, 'bool' ),
			ifSnippet = new ContextNode( this.ifNode, context ).build( builder, type ),
			elseSnippet = new ContextNode( this.elseNode, context ).build( builder, type );

		return `( ${ nodeSnippet } ? ${ ifSnippet } : ${ elseSnippet } )`;

	}

}

export default CondNode;
