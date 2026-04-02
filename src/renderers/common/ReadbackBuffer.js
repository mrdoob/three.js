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
	 * @param {BufferAttribute} attribute - The buffer attribute.
	 */
	constructor( attribute ) {

		super();

		/**
		 * The buffer attribute.
		 *
		 * @type {BufferAttribute}
		 */
		this.attribute = attribute;

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
