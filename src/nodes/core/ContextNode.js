import Node from './Node.js';
import { addMethodChaining, nodeProxy } from '../tsl/TSLCore.js';

/**
 * This node can be used as a context management component for another node.
 * {@link NodeBuilder} performs its node building process in a specific context and
 * this node allows the modify the context. A typical use case is to overwrite `getUV()` e.g.:
 *
 * ```js
 *node.context( { getUV: () => customCoord } );
 *```
 * @augments Node
 */
class ContextNode extends Node {

	static get type() {

		return 'ContextNode';

	}

	/**
	 * Constructs a new context node.
	 *
	 * @param {Node} node - The node whose context should be modified.
	 * @param {Object} [value={}] - The modified context data.
	 */
	constructor( node, value = {} ) {

		super();

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isContextNode = true;

		/**
		 * The node whose context should be modified.
		 *
		 * @type {Node}
		 */
		this.node = node;

		/**
		 * The modified context data.
		 *
		 * @type {Object}
		 * @default {}
		 */
		this.value = value;

	}

	/**
	 * This method is overwritten to ensure it returns the reference to {@link ContextNode#node}.
	 *
	 * @return {Node} A reference to {@link ContextNode#node}.
	 */
	getScope() {

		return this.node.getScope();

	}

	/**
	 * This method is overwritten to ensure it returns the type of {@link ContextNode#node}.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
	 */
	getNodeType( builder ) {

		return this.node.getNodeType( builder );

	}

	analyze( builder ) {

		this.node.build( builder );

	}

	setup( builder ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const node = this.node.build( builder );

		builder.setContext( previousContext );

		return node;

	}

	generate( builder, output ) {

		const previousContext = builder.getContext();

		builder.setContext( { ...builder.context, ...this.value } );

		const snippet = this.node.build( builder, output );

		builder.setContext( previousContext );

		return snippet;

	}

}

export default ContextNode;

/**
 * TSL function for creating a context node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node whose context should be modified.
 * @param {Object} [value={}] - The modified context data.
 * @returns {ContextNode}
 */
export const context = /*@__PURE__*/ nodeProxy( ContextNode );

/**
 * TSL function for defining a label context value for a given node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node whose context should be modified.
 * @param {string} name - The name/label to set.
 * @returns {ContextNode}
 */
export const label = ( node, name ) => context( node, { label: name } );

addMethodChaining( 'context', context );
addMethodChaining( 'label', label );
