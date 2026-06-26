/**
 * Reusable descriptor for `GPUDevice.createCommandEncoder()`.
 *
 * @private
 */
class GPUCommandEncoderDescriptor {

	constructor() {

		/**
		 * The label of the command encoder.
		 *
		 * @type {string}
		 */
		this.label = '';

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';

	}

}

export default GPUCommandEncoderDescriptor;
