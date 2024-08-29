import Node, { registerNode } from '../core/Node.js';
import { nodeProxy } from '../tsl/TSLBase.js';

class FunctionOverloadingNode extends Node {

	constructor( functionNodes = [], ...parametersNodes ) {

		super();

		this.functionNodes = functionNodes;
		this.parametersNodes = parametersNodes;

		this._candidateFnCall = null;

		this.global = true;

	}

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

FunctionOverloadingNode.type = /*@__PURE__*/ registerNode( 'FunctionOverloading', FunctionOverloadingNode );

const overloadingBaseFn = /*@__PURE__*/ nodeProxy( FunctionOverloadingNode );

export const overloadingFn = ( functionNodes ) => ( ...params ) => overloadingBaseFn( functionNodes, ...params );
