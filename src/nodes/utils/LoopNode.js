import Node from '../core/Node.js';
import { expression } from '../code/ExpressionNode.js';
import { nodeArray, Fn, bool } from '../tsl/TSLBase.js';
import { error } from '../../utils.js';


/**
 * Parameters for the Loop Node.
 *
 * @typedef {number | LoopObjectParams | Node<uint> | Node<int> | Node<boolean>} LoopParams
 */

/**
 * Utility nodes used in multiple shaders across the reduce-then-scan prefix sum`.
 *
 * @typedef {Object} LoopObjectParams
 * @property {number | Node<uint> | Node<int>} [start] - A number, or Node representation thereof, that represents the loop's initializer value. This value will be modified at the end of each loop iteration. Evaluates to 0 if undefined.
 * @property {number | Node<uint> | Node<int>} [end] - A number, or Node representation thereof, that represents the condition of the loop. The loop will terminate when the comparison between `start` and `end` evaluates to true. Evaluates to 0 if undefined.
 * @property {string} [name] - The name of the initializer variable within the shader.
 * @property {string} [type] - The data type of the initializer variable within the shader. Defaults to 'int'.
 * @property {'<=' | '<' | '>' | '>=' | '==' | '!='} [condition] - A string that inserts a code snippet into the shader, which specifies which comparison operator will be used to evaluate the relationship between `start` and `end`. If undefined, the condition will be inferred from the existing parameters.
 * @property {string | number | Function | Node} [update] - A string that inserts a code snippet into the shader, which specifies how the initializer variable will be updated at the end of each iteration of the loop. If undefined, the update snippet will be inferred from the existing parameters.
 */

/**
 * The loop body. Invoked with one entry per enclosing loop, keyed by that loop's `name`
 * (or `i`, `j`, `k`, … when unnamed). A `Node<boolean>` loop contributes no entry.
 *
 * @callback LoopBodyCallback
 * @param {Object<string, Node>} inputs - The loop variables of each enclosing loop.
 * @returns {void}
 */

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
 * The module also provides `Break()` and `Continue()` TSL expressions for loop control.
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

		super( 'void' );

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
		const params = this._getInternalParams();

		for ( let i = 0, l = params.length - 1; i < l; i ++ ) {

			const param = params[ i ];

			const name = ( param.isNode !== true && param.name ) || this.getVarName( i );
			const type = ( param.isNode !== true && param.type ) || 'int';

			inputs[ name ] = expression( name, type );

		}

		const stack = builder.addStack();

		const fnCall = params[ params.length - 1 ]( inputs );

		properties.returnsNode = fnCall.context( { nodeLoop: fnCall } );
		properties.stackNode = stack;

		const baseParam = params[ 0 ];

		if ( baseParam.isNode !== true && typeof baseParam.update === 'function' ) {

			const fnUpdateCall = Fn( baseParam.update )( inputs );

			properties.updateNode = fnUpdateCall.context( { nodeLoop: fnUpdateCall } );

		}

		builder.removeStack();

		return properties;

	}

	_getInternalParams() {

		const params = this.params;

		if ( typeof params[ 0 ] === 'function' ) {

			return [ bool( true ), params[ 0 ] ];

		}

		return params;

	}

	setup( builder ) {

		// setup properties

		this.getProperties( builder );

		if ( builder.fnCall ) {

			const shaderNodeData = builder.getDataFromNode( builder.fnCall.shaderNode );
			shaderNodeData.hasLoop = true;

		}

	}

	generate( builder ) {

		const properties = this.getProperties( builder );

		const params = this._getInternalParams();
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

				let updateSnippet;

				const deltaOperator = () => condition.includes( '<' ) ? '+=' : '-=';

				if ( update !== undefined && update !== null ) {

					switch ( typeof update ) {

						case 'function':

							const flow = builder.flowStagesNode( properties.updateNode, 'void' );
							const snippet = flow.code.replace( /\t|;/g, '' );

							updateSnippet = snippet;

							break;

						case 'number':

							updateSnippet = name + ' ' + deltaOperator() + ' ' + builder.generateConst( type, update );

							break;

						case 'string':

							updateSnippet = name + ' ' + update;

							break;

						default:

							if ( update.isNode ) {

								updateSnippet = name + ' ' + deltaOperator() + ' ' + update.build( builder );

							} else {

								error( 'TSL: \'Loop( { update: ... } )\' is not a function, string or number.', this.stackTrace );

								updateSnippet = 'break /* invalid update */';

							}

					}

				} else {

					if ( type === 'int' || type === 'uint' ) {

						update = condition.includes( '<' ) ? '++' : '--';

					} else {

						update = deltaOperator() + ' 1.';

					}

					updateSnippet = name + ' ' + update;

				}

				const declarationSnippet = builder.getVar( type, name ) + ' = ' + startSnippet;
				const conditionalSnippet = name + ' ' + condition + ' ' + endSnippet;

				loopSnippet = `for ( ${ declarationSnippet }; ${ conditionalSnippet }; ${ updateSnippet } )`;

			}

			builder.addFlowCode( ( i === 0 ? '\n' : '' ) + builder.tab + loopSnippet + ' {\n\n' ).addFlowTab();

		}

		const stackSnippet = stackNode.build( builder, 'void' );

		properties.returnsNode.build( builder, 'void' );

		builder.removeFlowTab().addFlowCode( '\n' + builder.tab + stackSnippet );

		for ( let i = 0, l = params.length - 1; i < l; i ++ ) {

			builder.addFlowCode( ( i === 0 ? '' : builder.tab ) + '}\n\n' ).removeFlowTab();

		}

		builder.addFlowTab();

	}

}

export default LoopNode;

/**
 * TSL function for creating a loop node.
 *
 * @tsl
 * @function
 * @param {[ ...LoopParams[], LoopBodyCallback ]} params - A list of arguments that contains optional arguments defining the loop's parameters, with the last argument always being a function callback.
 * @returns {LoopNode}
 */
export const Loop = ( ...params ) => new LoopNode( nodeArray( params, 'int' ) ).toStack();

/**
 * TSL function for creating a `continue` expression into the shader, which transfers control
 * to the next iteration of the expression's containg loop.
 *
 * @tsl
 * @function
 * @returns {ExpressionNode}
 */
export const Continue = () => expression( 'continue' ).toStack();

/**
 * TSL function for inserting a `break` expression into the current shader.
 *
 * @tsl
 * @function
 * @returns {ExpressionNode}
 */
export const Break = () => expression( 'break' ).toStack();
