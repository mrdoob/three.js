import StorageBufferNode from './StorageBufferNode.js';

/**
 * A storage buffer bound as a single struct instead of an array of elements. This allows
 * the struct's last member to be a runtime-sized array, whose length follows the size of
 * the bound buffer. A typical use is a queue with an atomic length ahead of its elements.
 *
 * ```js
 * const Queue = struct( {
 * 	length: { type: 'uint', atomic: true },
 * 	elements: 'array<u32>'
 * }, 'Queue' );
 *
 * const queue = storageStruct( new THREE.StorageBufferAttribute( new Uint32Array( count + 1 ), 1 ), Queue );
 * ```
 *
 * The node is only supported with the WebGPU backend.
 *
 * @augments StorageBufferNode
 */
class StorageStructNode extends StorageBufferNode {

	static get type() {

		return 'StorageStructNode';

	}

	/**
	 * Constructs a new storage struct node.
	 *
	 * @param {StorageBufferAttribute} value - The buffer data.
	 * @param {Struct} structType - The struct type of the buffer.
	 */
	constructor( value, structType ) {

		super( value, structType );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageStructNode = true;

	}

}

export default StorageStructNode;

/**
 * TSL function for creating a storage struct node.
 *
 * @tsl
 * @function
 * @param {StorageBufferAttribute} value - The buffer data.
 * @param {Struct} structType - The struct type of the buffer.
 * @returns {StorageStructNode}
 */
export const storageStruct = ( value, structType ) => new StorageStructNode( value, structType );
