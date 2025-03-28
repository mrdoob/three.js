import Node from '../core/Node.js';
import { expression } from '../code/ExpressionNode.js';
import { nodeObject, nodeArray } from '../tsl/TSLBase.js';

/**
 * This module offers a variety of ways to implement loops in TSL. In it's basic form it's:
 * ```js
 * Loop( count, ( { i } ) => {
 *
 * } );
 * ```
 * However, it is also possible to define a start and end ranges, data types and loop conditions:
 * ```js
 * Loop( { start: int( 0 ), end: int( 10 ), type: 'int', condition: '<' }, ( { i } ) => {
 *
 * } );
 *```
 * Nested loops can be defined in a compacted form:
 * ```js
 * Loop( 10, 5, ( { i, j } ) => {
 *
 * } );
 * ```
 * Loops that should run backwards can be defined like so:
 * ```js
 * Loop( { start: 10 }, () => {} );
 * ```
 * It is possible to execute with boolean values, similar to the `while` syntax.
 * ```js
 * const value = float( 0 ).toVar();
 *
 * Loop( value.lessThan( 10 ), () => {
 *
 * 	value.addAssign( 1 );
 *
 * } );
 * ```
 * The module also provides `Break()` and `Continue()` TSL expression for loop control.
 * @augments Node
 */
class LoopNode extends Node {

	static get type() {

		return 'LoopNode';

	}

	/**
	 * Constructs a new loop node.
	 *
	 * @param {Array<any>} params - Depending on the loop type, array holds different parameterization values for the loop.
	 */
	constructor( params = [] ) {

		super();

		this.params = params;

	}

	/**
	 * Returns a loop variable name based on an index. The pattern is
	 * `0` = `i`, `1`= `j`, `2`= `k` and so on.
	 *
	 * @param {number} index - The index.
	 * @return {string} The loop variable name.
	 */
	getVarName( index ) {

		return String.fromCharCode( 'i'.charCodeAt( 0 ) + index );

	}

	/**
	 * Returns properties about this node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {Object} The node properties.
	 */
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

	/**
	 * This method is overwritten since the node type is inferred based on the loop configuration.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
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

			let isWhile = false, start = null, end = null, name = null, type = null, condition = null, update = null;

			if ( param.isNode ) {

				if ( param.getNodeType( builder ) === 'bool' ) {

					isWhile = true;
					type = 'bool';
					end = param.build( builder, type );

				} else {

					type = 'int';
					name = this.getVarName( i );
					start = '0';
					end = param.build( builder, type );
					condition = '<';

				}

			} else {

				type = param.type || 'int';
				name = param.name || this.getVarName( i );
				start = param.start;
				end = param.end;
				condition = param.condition;
				update = param.update;

				if ( typeof start === 'number' ) start = builder.generateConst( type, start );
				else if ( start && start.isNode ) start = start.build( builder, type );

				if ( typeof end === 'number' ) end = builder.generateConst( type, end );
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

			let loopSnippet;

			if ( isWhile ) {

				loopSnippet = `while ( ${ end } )`;

			} else {

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

				loopSnippet = `for ( ${ declarationSnippet }; ${ conditionalSnippet }; ${ updateSnippet } )`;

			}

			builder.addFlowCode( ( i === 0 ? '\n' : '' ) + builder.tab + loopSnippet + ' {\n\n' ).addFlowTab();

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

/**
 * TSL function for creating a loop node.
 *
 * @tsl
 * @function
 * @param {...any} params - A list of parameters.
 * @returns {LoopNode}
 */
export const Loop = ( ...params ) => nodeObject( new LoopNode( nodeArray( params, 'int' ) ) ).append();

/**
 * TSL function for creating a `Continue()` expression.
 *
 * @tsl
 * @function
 * @returns {ExpressionNode}
 */
export const Continue = () => expression( 'continue' ).append();

/**
 * TSL function for creating a `Break()` expression.
 *
 * @tsl
 * @function
 * @returns {ExpressionNode}
 */
export const Break = () => expression( 'break' ).append();

// Deprecated

/**
 * @tsl
 * @function
 * @deprecated since r168. Use {@link Loop} instead.
 *
 * @param {...any} params
 * @returns {LoopNode}
 */
export const loop = ( ...params ) => { // @deprecated, r168

	console.warn( 'THREE.TSL: loop() has been renamed to Loop().' );
	return Loop( ...params );

};
