/**
 * Reusable descriptor for `GPUDevice.createBindGroup()`.
 *
 * @private
 */
class GPUBindGroupDescriptor {

	constructor() {

		/**
		 * The label of the bind group.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The bind group layout the bind group conforms to.
		 *
		 * @type {?GPUBindGroupLayout}
		 * @default null
		 */
		this.layout = null;

		/**
		 * The bind group entries.
		 *
		 * @type {Array<Object>}
		 */
		this.entries = [];

	}

	/**
	 * Resets the descriptor to its default state. The internal `entries` array
	 * is emptied without releasing its backing storage.
	 */
	reset() {

		this.label = '';
		this.layout = null;
		this.entries.length = 0;

	}

}

export default GPUBindGroupDescriptor;
