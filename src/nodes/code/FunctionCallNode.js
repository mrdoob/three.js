import TempNode from '../core/TempNode.js';
import { addMethodChaining, nodeArray, nodeObject, nodeObjects } from '../tsl/TSLCore.js';

/**
 * This module represents the call of a {@link FunctionNode}. Developers are usually not confronted
 * with this module since they use the predefined TSL syntax `wgslFn` and `glslFn` which encapsulate
 * this logic.
 *
 * @augments TempNode
 */
class FunctionCallNode extends TempNode {

	static get type() {

		return 'FunctionCallNode';

	}

	/**
	 * Constructs a new function call node.
	 *
	 * @param {?FunctionNode} functionNode - The function node.
	 * @param {Object<string, Node>} [parameters={}] - The parameters for the function call.
	 */
	constructor( functionNode = null, parameters = {} ) {

		super();

		/**
		 * The function node.
		 *
		 * @type {?FunctionNode}
		 * @default null
		 */
		this.functionNode = functionNode;

		/**
		 * The parameters of the function call.
		 *
		 * @type {Object<string, Node>}
		 * @default {}
		 */
		this.parameters = parameters;

	}

	/**
	 * Sets the parameters of the function call node.
	 *
	 * @param {Object<string, Node>} parameters - The parameters to set.
	 * @return {FunctionCallNode} A reference to this node.
	 */
	setParameters( parameters ) {

		this.parameters = parameters;

		return this;

	}

	/**
	 * Returns the parameters of the function call node.
	 *
	 * @return {Object<string, Node>} The parameters of this node.
	 */
	getParameters() {

		return this.parameters;

	}

	getNodeType( builder ) {

		return this.functionNode.getNodeType( builder );

	}

	generate( builder ) {

		const params = [];

		const functionNode = this.functionNode;

		const inputs = functionNode.getInputs( builder );
		const parameters = this.parameters;

		const generateInput = ( node, inputNode ) => {

			const type = inputNode.type;
			const pointer = type === 'pointer';

			let output;

			if ( pointer ) output = '&' + node.build( builder );
			else output = node.build( builder, type );

			return output;

		};

		if ( Array.isArray( parameters ) ) {

			for ( let i = 0; i < parameters.length; i ++ ) {

				params.push( generateInput( parameters[ i ], inputs[ i ] ) );

			}

		} else {

			for ( const inputNode of inputs ) {

				const node = parameters[ inputNode.name ];

				if ( node !== undefined ) {

					params.push( generateInput( node, inputNode ) );

				} else {

					throw new Error( `FunctionCallNode: Input '${inputNode.name}' not found in FunctionNode.` );

				}

			}

		}

		const functionName = functionNode.build( builder, 'property' );

		return `${functionName}( ${params.join( ', ' )} )`;

	}

}

export default FunctionCallNode;

export const call = ( func, ...params ) => {

	params = params.length > 1 || ( params[ 0 ] && params[ 0 ].isNode === true ) ? nodeArray( params ) : nodeObjects( params[ 0 ] );

	return nodeObject( new FunctionCallNode( nodeObject( func ), params ) );

};

addMethodChaining( 'call', call );
