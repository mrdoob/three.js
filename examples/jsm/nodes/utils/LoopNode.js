import Node, { addNodeClass } from '../core/Node.js';
import { expression } from '../code/ExpressionNode.js';
import { bypass } from '../core/BypassNode.js';
import { context as contextNode } from '../core/ContextNode.js';
import { addNodeElement, nodeObject, nodeArray } from '../shadernode/ShaderNode.js';

class LoopNode extends Node {

	constructor( params = [] ) {

		super();

		this.params = params;

	}

	getVarName( index ) {

		return String.fromCharCode( 'i'.charCodeAt() + index );

	}

	getProperties( builder ) {

		const properties = builder.getNodeProperties( this );

		if ( properties.stackNode !== undefined ) return properties;

		//

		const inputs = {};

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			const prop = this.getVarName( i );

			inputs[ prop ] = expression( prop, 'int' );

		}

		properties.returnsNode = this.params[ this.params.length - 1 ]( inputs, builder.addStack(), builder );
		properties.stackNode = builder.removeStack();

		return properties;

	}

	getNodeType( builder ) {

		const { returnsNode } = this.getProperties( builder );

		return returnsNode ? returnsNode.getNodeType( builder ) : 'void';

	}

	construct( builder ) {

		// construct properties

		this.getProperties( builder );

	}

	generate( builder ) {

		const properties = this.getProperties( builder );

		const context = { tempWrite: false };

		const params = this.params;
		const stackNode = properties.stackNode;

		const returnsSnippet = properties.returnsNode ? properties.returnsNode.build( builder ) : '';

		for ( let i = 0, l = params.length - 1; i < l; i ++ ) {

			const param = params[ i ];
			const property = this.getVarName( i );

			let start = null, end = null, direction = null;

			if ( param.isNode ) {

				start = '0';
				end = param.generate( builder, 'int' );
				direction = 'forward';

			} else {

				start = param.start;
				end = param.end;
				direction = param.direction;

				if ( typeof start === 'number' ) start = start.toString();
				else if ( start && start.isNode ) start = start.generate( builder, 'int' );

				if ( typeof end === 'number' ) end = end.toString();
				else if ( end && end.isNode ) end = end.generate( builder, 'int' );

				if ( start !== undefined && end === undefined ) {

					start = start + ' - 1';
					end = '0';
					direction = 'backwards';

				} else if ( end !== undefined && start === undefined ) {

					start = '0';
					direction = 'forward';

				}

				if ( direction === undefined ) {

					if ( Number( start ) > Number( end ) ) {

						direction = 'backwards';

					} else {

						direction = 'forward';

					}

				}

			}

			const internalParam = { start, end, direction };

			//

			const startSnippet = internalParam.start;
			const endSnippet = internalParam.end;

			let declarationSnippet = '';
			let conditionalSnippet = '';
			let updateSnippet = '';

			declarationSnippet += builder.getVar( 'int', property ) + ' = ' + startSnippet;

			if ( internalParam.direction === 'backwards' ) {

				conditionalSnippet += property + ' >= ' + endSnippet;
				updateSnippet += property + ' --';

			} else {

				// forward

				conditionalSnippet += property + ' < ' + endSnippet;
				updateSnippet += property + ' ++';

			}

			const forSnippet = `for ( ${ declarationSnippet }; ${ conditionalSnippet }; ${ updateSnippet } )`;

			builder.addFlowCode( ( i === 0 ? '\n' : '' ) + builder.tab + forSnippet + ' {\n\n' ).addFlowTab();

		}

		const stackSnippet = contextNode( stackNode, context ).build( builder, 'void' );

		builder.removeFlowTab().addFlowCode( '\n' + builder.tab + stackSnippet );

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			builder.addFlowCode( ( i === 0 ? '' : builder.tab ) + '}\n\n' ).removeFlowTab();

		}

		builder.addFlowTab();

		return returnsSnippet;

	}

}

export default LoopNode;

export const loop = ( ...params ) => nodeObject( new LoopNode( nodeArray( params, 'int' ) ) );

addNodeElement( 'loop', ( returns, ...params ) => bypass( returns, loop( ...params ) ) );

addNodeClass( LoopNode );
