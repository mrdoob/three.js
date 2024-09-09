import Node from '../core/Node.js';
import { expression } from '../code/ExpressionNode.js';
import { nodeObject, nodeArray } from '../tsl/TSLBase.js';

class LoopNode extends Node {

	static get type() {

		return 'LoopNode';

	}

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

			const param = this.params[ i ];

			const name = ( param.isNode !== true && param.name ) || this.getVarName( i );
			const type = ( param.isNode !== true && param.type ) || 'int';

			inputs[ name ] = expression( name, type );

		}

		const stack = builder.addStack(); // TODO: cache() it

		properties.returnsNode = this.params[ this.params.length - 1 ]( inputs, stack, builder );
		properties.stackNode = stack;

		builder.removeStack();

		return properties;

	}

	getNodeType( builder ) {

		const { returnsNode } = this.getProperties( builder );

		return returnsNode ? returnsNode.getNodeType( builder ) : 'void';

	}

	setup( builder ) {

		// setup properties

		this.getProperties( builder );

	}

	generate( builder ) {

		const properties = this.getProperties( builder );

		const params = this.params;
		const stackNode = properties.stackNode;

		for ( let i = 0, l = params.length - 1; i < l; i ++ ) {

			const param = params[ i ];

			let start = null, end = null, name = null, type = null, condition = null, update = null;

			if ( param.isNode ) {

				type = 'int';
				name = this.getVarName( i );
				start = '0';
				end = param.build( builder, type );
				condition = '<';

			} else {

				type = param.type || 'int';
				name = param.name || this.getVarName( i );
				start = param.start;
				end = param.end;
				condition = param.condition;
				update = param.update;

				if ( typeof start === 'number' ) start = start.toString();
				else if ( start && start.isNode ) start = start.build( builder, type );

				if ( typeof end === 'number' ) end = end.toString();
				else if ( end && end.isNode ) end = end.build( builder, type );

				if ( start !== undefined && end === undefined ) {

					start = start + ' - 1';
					end = '0';
					condition = '>=';

				} else if ( end !== undefined && start === undefined ) {

					start = '0';
					condition = '<';

				}

				if ( condition === undefined ) {

					if ( Number( start ) > Number( end ) ) {

						condition = '>=';

					} else {

						condition = '<';

					}

				}

			}

			const internalParam = { start, end, condition };

			//

			const startSnippet = internalParam.start;
			const endSnippet = internalParam.end;

			let declarationSnippet = '';
			let conditionalSnippet = '';
			let updateSnippet = '';

			if ( ! update ) {

				if ( type === 'int' || type === 'uint' ) {

					if ( condition.includes( '<' ) ) update = '++';
					else update = '--';

				} else {

					if ( condition.includes( '<' ) ) update = '+= 1.';
					else update = '-= 1.';

				}

			}

			declarationSnippet += builder.getVar( type, name ) + ' = ' + startSnippet;

			conditionalSnippet += name + ' ' + condition + ' ' + endSnippet;
			updateSnippet += name + ' ' + update;

			const forSnippet = `for ( ${ declarationSnippet }; ${ conditionalSnippet }; ${ updateSnippet } )`;

			builder.addFlowCode( ( i === 0 ? '\n' : '' ) + builder.tab + forSnippet + ' {\n\n' ).addFlowTab();

		}

		const stackSnippet = stackNode.build( builder, 'void' );

		const returnsSnippet = properties.returnsNode ? properties.returnsNode.build( builder ) : '';

		builder.removeFlowTab().addFlowCode( '\n' + builder.tab + stackSnippet );

		for ( let i = 0, l = this.params.length - 1; i < l; i ++ ) {

			builder.addFlowCode( ( i === 0 ? '' : builder.tab ) + '}\n\n' ).removeFlowTab();

		}

		builder.addFlowTab();

		return returnsSnippet;

	}

}

export default LoopNode;

export const Loop = ( ...params ) => nodeObject( new LoopNode( nodeArray( params, 'int' ) ) ).append();
export const Continue = () => expression( 'continue' ).append();
export const Break = () => expression( 'break' ).append();

//

export const loop = ( ...params ) => { // @deprecated, r168

	console.warn( 'TSL.LoopNode: loop() has been renamed to Loop().' );
	return Loop( ...params );

};
