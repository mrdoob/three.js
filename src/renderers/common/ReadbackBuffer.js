import { EventDispatcher } from '../../core/EventDispatcher.js';

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
	 * @param {number} maxByteLength - The maximum size of the buffer to be read back.
	 */
	constructor( maxByteLength ) {

		super();

		/**
		 * Name used for debugging purposes.
		 *
		 * @type {string}
		 */
		this.name = '';

		/**
		 * The mapped, read back array buffer.
		 *
		 * @type {ArrayBuffer|null}
		 */
		this.buffer = null;

		/**
		 * The maximum size of the buffer to be read back.
		 *
		 * @type {number}
		 */
		this.maxByteLength = maxByteLength;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isReadbackBuffer = true;

		this._mapped = false;

	}

	/**
	 * Releases the mapped buffer data so the GPU buffer can be
	 * used by the GPU again.
	 *
	 * Note: Any `ArrayBuffer` data associated with this readback buffer
	 * are removed and no longer accessible after calling this method.
	 */
	release() {

		this.dispatchEvent( { type: 'release' } );

	}

	/**
	 * Frees internal resources.
	 */
	dispose() {

		this.dispatchEvent( { type: 'dispose' } );

	}

}

export default ReadbackBuffer;
