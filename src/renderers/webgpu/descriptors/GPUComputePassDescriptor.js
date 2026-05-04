/**
 * Reusable descriptor for `GPUCommandEncoder.beginComputePass()`.
 *
 * @private
 */
class GPUComputePassDescriptor {

	constructor() {

		/**
		 * The label of the compute pass.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * Defines which timestamp values are written and where.
		 *
		 * @type {Object|undefined}
		 */
		this.timestampWrites = undefined;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.timestampWrites = undefined;

	}

}

export default GPUComputePassDescriptor;
