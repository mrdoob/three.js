import StorageBufferAttribute from './StorageBufferAttribute.js';

/**
 * This special type of buffer attribute is intended for compute shaders.
 * It can be used to encode draw parameters for indirect draw calls.
 *
 * Note: This type of buffer attribute can only be used with `WebGPURenderer`
 * and a WebGPU backend.
 *
 * @augments StorageBufferAttribute
 */
class IndirectStorageBufferAttribute extends StorageBufferAttribute {

	/**
	 * Constructs a new storage buffer attribute.
	 *
	 * @param {Number|Uint32Array} count - The item count. It is also valid to pass a `Uint32Array` as an argument.
	 * The subsequent parameter is then obsolete.
	 * @param {Number} itemSize - The item size.
	 */
	constructor( count, itemSize ) {

		super( count, itemSize, Uint32Array );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isIndirectStorageBufferAttribute = true;

	}

}

export default IndirectStorageBufferAttribute;
