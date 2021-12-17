import Node from '../core/Node.js';
import PropertyNode from '../core/PropertyNode.js';
import ContextNode from '../core/ContextNode.js';

class CondNode extends Node {

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

		const context = { temp: false };
		const nodeProperty = new PropertyNode( null, type ).build( builder );

		const nodeSnippet = new ContextNode( this.node/*, context*/ ).build( builder, 'bool' ),
			ifSnippet = new ContextNode( this.ifNode, context ).build( builder, type ),
			elseSnippet = new ContextNode( this.elseNode, context ).build( builder, type );

		builder.addFlowCode( `if ( ${nodeSnippet} ) {

\t\t${nodeProperty} = ${ifSnippet};

\t} else {

\t\t${nodeProperty} = ${elseSnippet};

\t}` );

		return nodeProperty;

	}

}

export default CondNode;
