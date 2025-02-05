import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/**
 * The class generates the code of a given node but returns another node in the output.
 * This can be used to call a method or node that does not return a value, i.e.
 * type `void` on an input where returning a value is required. Example:
 *
 * ```js
 * material.colorNode = myColor.bypass( runVoidFn() )
 *```
 *
 * @augments Node
 */
class BypassNode extends Node {

	static get type() {

		return 'BypassNode';

	}

	/**
	 * Constructs a new bypass node.
	 *
	 * @param {Node} outputNode - The output node.
	 * @param {Node} callNode - The call node.
	 */
	constructor( outputNode, callNode ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isBypassNode = true;

		/**
		 * The output node.
		 *
		 * @type {Node}
		 */
		this.outputNode = outputNode;

		/**
		 * The call node.
		 *
		 * @type {Node}
		 */
		this.callNode = callNode;

	}

	getNodeType( builder ) {

		return this.outputNode.getNodeType( builder );

	}

	generate( builder ) {

		const snippet = this.callNode.build( builder, 'void' );

		if ( snippet !== '' ) {

			builder.addLineFlowCode( snippet, this );

		}

		return this.outputNode.build( builder );

	}

}

export default BypassNode;

/**
 * TSL function for creating a bypass node.
 *
 * @tsl
 * @function
 * @param {Node} outputNode - The output node.
 * @param {Node} callNode - The call node.
 * @returns {BypassNode}
 */
export const bypass = /*@__PURE__*/ nodeProxy( BypassNode );

addMethodChaining( 'bypass', bypass );
