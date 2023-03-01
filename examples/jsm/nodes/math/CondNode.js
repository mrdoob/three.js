import Node from '../core/Node.js';
import PropertyNode from '../core/PropertyNode.js';
import ContextNode from '../core/ContextNode.js';

class CondNode extends Node {

	constructor( condNode, ifNode, elseNode = null ) {

		super();

		this.condNode = condNode;

		this.ifNode = ifNode;
		this.elseNode = elseNode;

	}

	getNodeType( builder ) {

		const ifType = this.ifNode.getNodeType( builder );

		if ( this.elseNode !== null ) {

			const elseType = this.elseNode.getNodeType( builder );

			if ( builder.getTypeLength( elseType ) > builder.getTypeLength( ifType ) ) {

				return elseType;

			}

		}

		return ifType;

	}

	generate( builder ) {

		const type = this.getNodeType( builder );
		const context = { tempWrite: false };

		const needsProperty = this.ifNode.getNodeType( builder ) !== 'void' || ( this.elseNode && this.elseNode.getNodeType( builder ) !== 'void' );
		const nodeProperty = needsProperty ? new PropertyNode( type ).build( builder ) : '';

		const nodeSnippet = new ContextNode( this.condNode/*, context*/ ).build( builder, 'bool' );

		builder.addFlowCode( `if ( ${nodeSnippet} ) {\n\n\t\t`, false );

		let ifSnippet = new ContextNode( this.ifNode, context ).build( builder, type );

		ifSnippet = needsProperty ? nodeProperty + ' = ' + ifSnippet + ';' : ifSnippet;

		builder.addFlowCode( ifSnippet + '\n\n\t}', false );

		let elseSnippet = this.elseNode ? new ContextNode( this.elseNode, context ).build( builder, type ) : null;

		if ( elseSnippet ) {

			elseSnippet = nodeProperty ? nodeProperty + ' = ' + elseSnippet + ';' : elseSnippet;

			builder.addFlowCode( 'else {\n\n\t\t' + elseSnippet + '\n\n\t}', false );

		}

		return nodeProperty;

	}

}

export default CondNode;
