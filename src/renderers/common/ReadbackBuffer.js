import { EventDispatcher } from '../../core/EventDispatcher.js';

let _id = 0;

/**
 * A readback buffer is used to transfer data from the GPU to the CPU.
 * It is primarily used to read back compute shader results.
 *
 * @augments EventDispatcher
 */
class ReadbackBuffer extends EventDispatcher {

	/**
	 * Constructs a new readback buffer.
	 *
	 * @param {BufferAttribute} size - The buffer attribute.
	 */
	constructor( size ) {

		super();

		/**
		 * The size of the buffer in bytes.
		 *
		 * @type {number}
		 */
		this.size = size;

		/**
		 * A unique identifier for this readback buffer.
		 *
		 * @type {number}
		 */
		this.id = _id ++;

		/**
		 * A name for this readback buffer.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReadbackBuffer = true;

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export default ReadbackBuffer;
