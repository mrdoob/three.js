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

		const needsProperty = this.ifNode.getNodeType( builder ) !== 'void' || ( this.elseNode && this.elseNode.getNodeType( builder ) !== 'void' );
		const nodeProperty = needsProperty ? property( type ).build( builder ) : '';

		const nodeSnippet = contextNode( this.condNode/*, context*/ ).build( builder, 'bool' );

		builder.addFlowCode( `if ( ${nodeSnippet} ) {\n\n\t\t`, false );

		let ifSnippet = contextNode( this.ifNode, context ).build( builder, type );

		ifSnippet = needsProperty ? nodeProperty + ' = ' + ifSnippet + ';' : ifSnippet;

		builder.addFlowCode( ifSnippet + '\n\n\t}', false );

		let elseSnippet = this.elseNode ? contextNode( this.elseNode, context ).build( builder, type ) : null;

		if ( elseSnippet ) {

			elseSnippet = nodeProperty ? nodeProperty + ' = ' + elseSnippet + ';' : elseSnippet;

			builder.addFlowCode( 'else {\n\n\t\t' + elseSnippet + '\n\n\t}', false );

		}

		return nodeProperty;

	}

}

export default CondNode;

export const cond = nodeProxy( CondNode );

addNodeElement( 'cond', cond );

addNodeClass( CondNode );
