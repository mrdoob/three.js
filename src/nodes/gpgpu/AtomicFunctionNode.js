import TempNode from '../core/TempNode.js';
import { nodeProxy } from '../tsl/TSLCore.js';

/**
 * `AtomicFunctionNode` represents any function that can operate on atomic variable types
 * within a shader. In an atomic function, any modification to an atomic variable will
 * occur as an indivisible step with a defined order relative to other modifications.
 * Accordingly, even if multiple atomic functions are modifying an atomic variable at once
 * atomic operations will not interfere with each other.
 *
 * This node can only be used with a WebGPU backend.
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
	 * @param {string} method - The signature of the atomic function to construct.
	 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
	 * @param {Node} valueNode - The value that mutates the atomic variable.
	 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
	 */
	constructor( method, pointerNode, valueNode, storeNode = null ) {

		super( 'uint' );

		/**
		 * The signature of the atomic function to construct.
		 *
		 * @type {string}
		 */
		this.method = method;

		/**
		 * An atomic variable or element of an atomic buffer.
		 *
		 * @type {Node}
		 */
		this.pointerNode = pointerNode;

		/**
		 * A value that modifies the atomic variable.
		 *
		 * @type {Node}
		 */
		this.valueNode = valueNode;

		/**
		 * A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
		 *
		 * @type {?Node}
		 * @default null
		 */
		this.storeNode = storeNode;

	}

	/**
	 * Overwrites the default implementation to return the type of
	 * the pointer node.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The input type.
	 */
	getInputType( builder ) {

		return this.pointerNode.getNodeType( builder );

	}

	/**
	 * Overwritten since the node type is inferred from the input type.
	 *
	 * @param {NodeBuilder} builder - The current node builder.
	 * @return {string} The node type.
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

		if ( b !== null ) {

			params.push( b.build( builder, inputType ) );


		}

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
 * @tsl
 * @function
 * @param {string} method - The signature of the atomic function to construct.
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
const atomicNode = nodeProxy( AtomicFunctionNode );

/**
 * TSL function for appending an atomic function call into the programmatic flow of a compute shader.
 *
 * @tsl
 * @function
 * @param {string} method - The signature of the atomic function to construct.
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicFunc = ( method, pointerNode, valueNode, storeNode = null ) => {

	const node = atomicNode( method, pointerNode, valueNode, storeNode );
	node.append();

	return node;

};

/**
 * Loads the value stored in the atomic variable.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicLoad = ( pointerNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_LOAD, pointerNode, null, storeNode );

/**
 * Stores a value in the atomic variable.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicStore = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_STORE, pointerNode, valueNode, storeNode );

/**
 * Increments the value stored in the atomic variable.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicAdd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_ADD, pointerNode, valueNode, storeNode );

/**
 * Decrements the value stored in the atomic variable.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicSub = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_SUB, pointerNode, valueNode, storeNode );

/**
 * Stores in an atomic variable the maximum between its current value and a parameter.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicMax = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MAX, pointerNode, valueNode, storeNode );

/**
 * Stores in an atomic variable the minimum between its current value and a parameter.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicMin = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_MIN, pointerNode, valueNode, storeNode );

/**
 * Stores in an atomic variable the bitwise AND of its value with a parameter.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicAnd = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_AND, pointerNode, valueNode, storeNode );

/**
 * Stores in an atomic variable the bitwise OR of its value with a parameter.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicOr = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_OR, pointerNode, valueNode, storeNode );

/**
 * Stores in an atomic variable the bitwise XOR of its value with a parameter.
 *
 * @tsl
 * @function
 * @param {Node} pointerNode - An atomic variable or element of an atomic buffer.
 * @param {Node} valueNode - The value that mutates the atomic variable.
 * @param {?Node} [storeNode=null] - A variable storing the return value of an atomic operation, typically the value of the atomic variable before the operation.
 * @returns {AtomicFunctionNode}
 */
export const atomicXor = ( pointerNode, valueNode, storeNode = null ) => atomicFunc( AtomicFunctionNode.ATOMIC_XOR, pointerNode, valueNode, storeNode );
