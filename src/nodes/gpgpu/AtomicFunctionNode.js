import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/** @module AtomicFunctionNode **/

/**
 * TODO
 *
 * @augments TempNode
 */
class AtomicFunctionNode extends TempNode {

	static get type() {

		return 'AtomicFunctionNode';

	}

	/**
	 * Constructs a new atomic function node.
	 *
	 * @param {String} method - TODO.
	 * @param {Node} pointerNode - TODO.
	 * @param {Node} valueNode - TODO.
	 * @param {Node?} [storeNode=null] - TODO.
	 */
	constructor( method, pointerNode, valueNode, storeNode = null ) {

		super( 'uint' );

		/**
		 * TODO
		 *
		 * @type {String}
		 */
		this.method = method;

		/**
		 * TODO
		 *
		 * @type {Node}
		 */
		this.pointerNode = pointerNode;

		/**
		 * TODO
		 *
		 * @type {Node}
		 */
		this.valueNode = valueNode;

		/**
		 * TODO
		 *
		 * @type {Node?}
		 * @default null
		 */
		this.storeNode = storeNode;

	}

	/**
	 * Overwrites the default implementation to return the type of
	 * the pointer node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The input type.
	 */
	getInputType( builder ) {

		return this.pointerNode.getNodeType( builder );

	}

	/**
	 * Overwritten since the node type is inferred from the input type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {String} The node type.
	 */
	getNodeType( builder ) {

		return this.getInputType( builder );

	}

	generate( builder ) {

		const method = this.method;

		const type = this.getNodeType( builder );
		const inputType = this.getInputType( builder );

		const a = this.pointerNode;
		const b = this.valueNode;

		const params = [];

		params.push( `&${ a.build( builder, inputType ) }` );
		params.push( b.build( builder, inputType ) );

		const methodSnippet = `${ builder.getMethod( method, type ) }( ${params.join( ', ' )} )`;

		if ( this.storeNode !== null ) {

			const varSnippet = this.storeNode.build( builder, inputType );

			builder.addLineFlowCode( `${varSnippet} = ${methodSnippet}`, this );

		} else {

			builder.addLineFlowCode( methodSnippet, this );

		}

	}

}

AtomicFunctionNode.ATOMIC_LOAD = 'atomicLoad';
AtomicFunctionNode.ATOMIC_STORE = 'atomicStore';
AtomicFunctionNode.ATOMIC_ADD = 'atomicAdd';
AtomicFunctionNode.ATOMIC_SUB = 'atomicSub';
AtomicFunctionNode.ATOMIC_MAX = 'atomicMax';
AtomicFunctionNode.ATOMIC_MIN = 'atomicMin';
AtomicFunctionNode.ATOMIC_AND = 'atomicAnd';
AtomicFunctionNode.ATOMIC_OR = 'atomicOr';
AtomicFunctionNode.ATOMIC_XOR = 'atomicXor';

export default AtomicFunctionNode;

/**
 * TSL function for creating an atomic function node.
 *
 * @function
 * @param {String} method - TODO.
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
const atomicNode = nodeProxy( AtomicFunctionNode );

/**
 * TODO
 *
 * @function
 * @param {String} method - TODO.
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicFunc = ( method, pointerNode, valueNode, storeNode = null ) => {

	const node = atomicNode( method, pointerNode, valueNode, storeNode );
	node.append();

	return node;

};

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicStore = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_STORE, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicAdd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_ADD, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicSub = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_SUB, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicMax = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MAX, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicMin = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MIN, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicAnd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_AND, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicOr = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_OR, pointerNode, valueNode, storeNode );

/**
 * TODO
 *
 * @function
 * @param {Node} pointerNode - TODO.
 * @param {Node} valueNode - TODO.
 * @param {Node?} [storeNode=null] - TODO.
 * @returns {AtomicFunctionNode}
 */
export const atomicXor = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_XOR, pointerNode, valueNode, storeNode );
