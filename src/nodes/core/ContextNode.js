import Node from './Node.js';
import { addMethodChaining } from '../tsl/TSLCore.js';
import { warn } from '../../utils.js';

/**
 * This node can be used as a context management component for another node.
 * {@link NodeBuilder} performs its node building process in a specific context and
 * this node allows the modify the context. A typical use case is to overwrite `getUV()` e.g.:
 *
 * ```js
 *node.context( { getUV: () => customCoord } );
 *\// or
 *material.contextNode = context( { getUV: () => customCoord } );
 *\// or
 *renderer.contextNode = context( { getUV: () => customCoord } );
 *\// or
 *scenePass.contextNode = context( { getUV: () => customCoord } );
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
	constructor( node = null, value = {} ) {

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

	/**
	 * Gathers the context data from all parent context nodes.
	 *
	 * @return {Object} The gathered context data.
	 */
	getFlowContextData() {

		const children = [];

		this.traverse( ( node ) => {

			if ( node.isContextNode === true ) {

				children.push( node.value );

			}

		} );

		return Object.assign( {}, ...children );

	}

	/**
	 * This method is overwritten to ensure it returns the member type of {@link ContextNode#node}.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @param {string} name - The member name.
	 * @returns {string} The member type.
	 */
	getMemberType( builder, name ) {

		return this.node.getMemberType( builder, name );

	}

	analyze( builder ) {

		const previousContext = builder.addContext( this.value );

		this.node.build( builder );

		builder.setContext( previousContext );

	}

	setup( builder ) {

		const previousContext = builder.addContext( this.value );

		this.node.build( builder );

		builder.setContext( previousContext );

	}

	generate( builder, output ) {

		const previousContext = builder.addContext( this.value );

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
 * @param {Node|Object} [nodeOrValue={}] - The node whose context should be modified or the modified context data.
 * @param {Object} [value={}] - The modified context data.
 * @returns {ContextNode}
 */
export const context = ( nodeOrValue = null, value = {} ) => {

	let node = nodeOrValue;

	if ( node === null || node.isNode !== true ) {

		value = node || value;
		node = null;

	}

	return new ContextNode( node, value );

};

/**
 * TSL function for defining a uniformFlow context value for a given node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node whose dependencies should all execute within a uniform control-flow path.
 * @returns {ContextNode}
 */
export const uniformFlow = ( node ) => context( node, { uniformFlow: true } );

/**
 * TSL function for defining a name for the context value for a given node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node whose context should be modified.
 * @param {string} name - The name to set.
 * @returns {ContextNode}
 */
export const setName = ( node, name ) => context( node, { nodeName: name } );

/**
 * TSL function for defining a label context value for a given node.
 *
 * @tsl
 * @function
 * @deprecated
 * @param {Node} node - The node whose context should be modified.
 * @param {string} name - The name/label to set.
 * @returns {ContextNode}
 */
export function label( node, name ) {

	warn( 'TSL: "label()" has been deprecated. Use "setName()" instead.' ); // @deprecated r179

	return setName( node, name );

}

/**
 * TSL function for overriding a context for a given node.
 *
 * @tsl
 * @function
 * @param {Node} node - The node whose context should be modified.
 * @param {Node} targetNode - The node that will be replaced.
 * @param {Node} sourceNode - The node that will replace the targetNode.
 * @returns {ContextNode}
 */
export const overrideContext = ( node, targetNode, sourceNode ) => {

	const cleanSource = context( sourceNode, { [ targetNode.uuid ]: undefined } );

	return context( node, { [ targetNode.uuid ]: cleanSource } );

};

addMethodChaining( 'context', context );
addMethodChaining( 'label', label );
addMethodChaining( 'uniformFlow', uniformFlow );
addMethodChaining( 'setName', setName );
addMethodChaining( 'overrideContext', overrideContext );
