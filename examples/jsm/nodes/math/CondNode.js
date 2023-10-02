import Node, { addNodeClass } from '../core/Node.js';
import { property } from '../core/PropertyNode.js';
import { context as contextNode } from '../core/ContextNode.js';
import { addNodeElement, nodeProxy } from '../shadernode/ShaderNode.js';

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

		const { ifNode, elseNode } = this;

		const needsProperty = ifNode.getNodeType( builder ) !== 'void' || ( elseNode && elseNode.getNodeType( builder ) !== 'void' );
		const nodeProperty = needsProperty ? property( type ).build( builder ) : '';

		const nodeSnippet = contextNode( this.condNode/*, context*/ ).build( builder, 'bool' );

		builder.addFlowCode( `\n${ builder.tab }if ( ${ nodeSnippet } ) {\n\n` ).addFlowTab();

		let ifSnippet = contextNode( this.ifNode, context ).build( builder, type );

		ifSnippet = needsProperty ? nodeProperty + ' = ' + ifSnippet + ';' : ifSnippet;

		builder.removeFlowTab().addFlowCode( builder.tab + '\t' + ifSnippet + '\n\n' + builder.tab + '}' );

		if ( elseNode !== null ) {

			builder.addFlowCode( ' else {\n\n' ).addFlowTab();

			let elseSnippet = contextNode( elseNode, context ).build( builder, type );
			elseSnippet = nodeProperty ? nodeProperty + ' = ' + elseSnippet + ';' : elseSnippet;

			builder.removeFlowTab().addFlowCode( builder.tab + '\t' + elseSnippet + '\n\n' + builder.tab + '}\n\n' );

		} else {

			builder.addFlowCode( '\n\n' );

		}

		return nodeProperty;

	}

}

export default CondNode;

export const cond = nodeProxy( CondNode );

addNodeElement( 'cond', cond );

addNodeClass( 'CondNode', CondNode );
