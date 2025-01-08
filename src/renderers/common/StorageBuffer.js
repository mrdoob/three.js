import Buffer from './Buffer.js';

/**
 * Represents a storage buffer binding type.
 *
 * @private
 * @augments Buffer
 */
class StorageBuffer extends Buffer {

	/**
	 * Constructs a new uniform buffer.
	 *
	 * @param {String} name - The buffer's name.
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	constructor( name, attribute ) {

		super( name, attribute ? attribute.array : null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {BufferAttribute}
		 */
		this.attribute = attribute;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageBuffer = true;

	}

}

export default StorageBuffer;
