import { nodeProxy } from '../tsl/TSLBase.js';
import ArrayElementNode from './ArrayElementNode.js';

/** @module StorageArrayElementNode **/

/**
 * This class enables element access on instances of {@link StorageBufferNode}.
 * In most cases, it is indirectly used when accessing elements with the
 * {@link StorageBufferNode#element} method.
 *
 * ```js
 * const position = positionStorage.element( instanceIndex );
 * ```
 *
 * @augments ArrayElementNode
 */
class StorageArrayElementNode extends ArrayElementNode {

	static get type() {

		return 'StorageArrayElementNode';

	}

	/**
	 * Constructs storage buffer element node.
	 *
	 * @param {StorageBufferNode} storageBufferNode - The storage buffer node.
	 * @param {Node} indexNode - The index node that defines the element access.
	 */
	constructor( storageBufferNode, indexNode ) {

		super( storageBufferNode, indexNode );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageArrayElementNode = true;

	}

	/**
	 * The storage buffer node.
	 *
	 * @param {Node} value
	 * @type {StorageBufferNode}
	 */
	set storageBufferNode( value ) {

		this.node = value;

	}

	get storageBufferNode() {

		return this.node;

	}

	getMemberType( builder, name ) {

		const structTypeNode = this.storageBufferNode.structTypeNode;

		if ( structTypeNode ) {

			return structTypeNode.getMemberType( builder, name );

		}

		return 'void';

	}

	setup( builder ) {

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( this.node.isPBO === true ) {

				builder.setupPBO( this.node );

			}

		}

		return super.setup( builder );

	}

	generate( builder, output ) {

		let snippet;

		const isAssignContext = builder.context.assign;

		//

		if ( builder.isAvailable( 'storageBuffer' ) === false ) {

			if ( this.node.isPBO === true && isAssignContext !== true && ( this.node.value.isInstancedBufferAttribute || builder.shaderStage !== 'compute' ) ) {

				snippet = builder.generatePBO( this );

			} else {

				snippet = this.node.build( builder );

			}

		} else {

			snippet = super.generate( builder );

		}

		if ( isAssignContext !== true ) {

			const type = this.getNodeType( builder );

			snippet = builder.format( snippet, type, output );

		}

		return snippet;

	}

}

export default StorageArrayElementNode;

/**
 * TSL function for creating a storage element node.
 *
 * @function
 * @param {StorageBufferNode} storageBufferNode - The storage buffer node.
 * @param {Node} indexNode - The index node that defines the element access.
 * @returns {StorageArrayElementNode}
 */
export const storageElement = /*@__PURE__*/ nodeProxy( StorageArrayElementNode );
