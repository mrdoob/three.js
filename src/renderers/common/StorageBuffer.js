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
	 * @param {string} name - The buffer's name.
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	constructor( name, attribute ) {

		super( name, attribute ? attribute.array : null );

		/**
		 * This flag can be used for type testing.
		 *
		 * @private
		 * @type {BufferAttribute}
		 */
		this._attribute = attribute;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageBuffer = true;

	}

	/**
	 * The storage buffer attribute.
	 *
	 * @type {BufferAttribute}
	 */
	get attribute() {

		return this._attribute;

	}

}

export default StorageBuffer;
