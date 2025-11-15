import Node from './Node.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/**
 * This node can be used as a global context management component for another node.
 * {@link NodeBuilder} performs its node building process in a specific context and
 * this node allows the modify the context. A typical use case is to overwrite `getUV()` e.g.:
 *
 * ```js
 *material.contextNode = globalContext( { getUV: () => customCoord } );
 *\// or
 *renderer.globalContext = globalContext( { getUV: () => customCoord } );
 *\// or
 *scenePass.globalContext = globalContext( { getUV: () => customCoord } );
 *```
 * @augments Node
 */
class GlobalContextNode extends Node {

	static get type() {

		return 'GlobalContextNode';

	}

	/**
	 * Constructs a new global context node.
	 *
	 * @param {Object} [value={}] - The modified context data.
	 */
	constructor( value = {} ) {

		super( 'void' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isGlobalContextNode = true;

		/**
		 * The modified context data.
		 *
		 * @type {Object}
		 * @default {}
		 */
		this.value = value;

	}

}

export default GlobalContextNode;

/**
 * TSL function for creating a global context node.
 *
 * @tsl
 * @function
 * @param {Object} [value={}] - The modified context data.
 * @returns {GlobalContextNode}
 */
export const globalContext = /*@__PURE__*/ nodeProxy( GlobalContextNode );
