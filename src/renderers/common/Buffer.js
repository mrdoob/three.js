import Binding from './Binding.js';
import { getFloatLength } from './BufferUtils.js';

/**
 * Represents a buffer binding type.
 *
 * @private
 * @abstract
 * @augments Binding
 */
class Buffer extends Binding {

	/**
	 * Constructs a new buffer.
	 *
	 * @param {String} name - The buffer's name.
	 * @param {TypedArray} [buffer=null] - The buffer.
	 */
	constructor( name, buffer = null ) {

		super( name );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isBuffer = true;

		/**
		 * The bytes per element.
		 *
		 * @type {Number}
		 */
		this.bytesPerElement = Float32Array.BYTES_PER_ELEMENT;

		/**
		 * A reference to the internal buffer.
		 *
		 * @private
		 * @type {TypedArray}
		 */
		this._buffer = buffer;

	}

	/**
	 * The buffer's byte length.
	 *
	 * @type {Number}
	 * @readonly
	 */
	get byteLength() {

		return getFloatLength( this._buffer.byteLength );

	}

	/**
	 * A reference to the internal buffer.
	 *
	 * @type {Float32Array}
	 * @readonly
	 */
	get buffer() {

		return this._buffer;

	}

	/**
	 * Updates the binding.
	 *
	 * @return {Boolean} Whether the buffer has been updated and must be
	 * uploaded to the GPU.
	 */
	update() {

		return true;

	}

}

export default Buffer;
