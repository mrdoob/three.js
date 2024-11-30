import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/**
 * TODO: Explain the purpose of this module.
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
		 * @type {Boolean}
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

export const bypass = /*@__PURE__*/ nodeProxy( BypassNode );

addMethodChaining( 'bypass', bypass );
