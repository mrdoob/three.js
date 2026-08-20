/**
 * Reusable descriptor for `GPUDevice.createBuffer()`.
 *
 * @private
 */
class GPUBufferDescriptor {

	constructor() {

		/**
		 * The label of the buffer.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The size of the buffer in bytes.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.size = 0;

		/**
		 * The allowed usages for the buffer.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.usage = 0;

		/**
		 * Whether the buffer is in the mapped state at creation.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.mappedAtCreation = false;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.size = 0;
		this.usage = 0;
		this.mappedAtCreation = false;

	}

}

export default GPUBufferDescriptor;
