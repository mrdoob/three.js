/**
 * Reusable descriptor for `GPUDevice.createQuerySet()`.
 *
 * @private
 */
class GPUQuerySetDescriptor {

	constructor() {

		/**
		 * The label of the query set.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The type of queries managed by the set.
		 *
		 * @type {string|undefined}
		 */
		this.type = undefined;

		/**
		 * The number of queries managed by the set.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.count = 0;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.type = undefined;
		this.count = 0;

	}

}

export default GPUQuerySetDescriptor;
