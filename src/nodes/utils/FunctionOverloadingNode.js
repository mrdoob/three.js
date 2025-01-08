import Node from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/** @module FunctionOverloadingNode **/

/**
 * This class allows to define multiple overloaded versions
 * of the same function. Depending on the parameters of the function
 * call, the node picks the best-fit overloaded version.
 *
 * @augments Node
 */
class FunctionOverloadingNode extends Node {

	static get type() {

		return 'FunctionOverloadingNode';

	}

	/**
	 * Constructs a new function overloading node.
	 *
	 * @param {Array<Function>} functionNodes - Array of `Fn` function definitions.
	 * @param {...Node} parametersNodes - A list of parameter nodes.
	 */
	constructor( functionNodes = [], ...parametersNodes ) {

		super();

		/**
		 * Array of `Fn` function definitions.
		 *
		 * @type {Array<Function>}
		 */
		this.functionNodes = functionNodes;

		/**
		 * A list of parameter nodes.
		 *
		 * @type {Array<Node>}
		 */
		this.parametersNodes = parametersNodes;

		/**
		 * The selected overloaded function call.
		 *
		 * @private
		 * @type {ShaderCallNodeInternal}
		 */
		this._candidateFnCall = null;

		/**
		 * This node is marked as global.
		 *
		 * @type {Boolean}
		 * @default true
		 */
		this.global = true;

	}

	/**
	 * This method is overwritten since the node type is inferred from
	 * the function's return type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType() {

		return this.functionNodes[ 0 ].shaderNode.layout.type;

	}

	setup( builder ) {

		const params = this.parametersNodes;

		let candidateFnCall = this._candidateFnCall;

		if ( candidateFnCall === null ) {

			let candidateFn = null;
			let candidateScore = - 1;

			for ( const functionNode of this.functionNodes ) {

				const shaderNode = functionNode.shaderNode;
				const layout = shaderNode.layout;

				if ( layout === null ) {

					throw new Error( 'FunctionOverloadingNode: FunctionNode must be a layout.' );

				}

				const inputs = layout.inputs;

				if ( params.length === inputs.length ) {

					let score = 0;

					for ( let i = 0; i < params.length; i ++ ) {

						const param = params[ i ];
						const input = inputs[ i ];

						if ( param.getNodeType( builder ) === input.type ) {

							score ++;

						} else {

							score = 0;

						}

					}

					if ( score > candidateScore ) {

						candidateFn = functionNode;
						candidateScore = score;

					}

				}

			}

			this._candidateFnCall = candidateFnCall = candidateFn( ...params );

		}

		return candidateFnCall;

	}

}

export default FunctionOverloadingNode;

const overloadingBaseFn = /*@__PURE__*/ nodeProxy( FunctionOverloadingNode );

/**
 * TSL function for creating a function overloading node.
 *
 * @function
 * @param {Array<Function>} functionNodes - Array of `Fn` function definitions.
 * @returns {FunctionOverloadingNode}
 */
export const overloadingFn = ( functionNodes ) => ( ...params ) => overloadingBaseFn( functionNodes, ...params );
