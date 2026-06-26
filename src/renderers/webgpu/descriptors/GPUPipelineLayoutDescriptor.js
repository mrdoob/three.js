/**
 * Reusable descriptor for `GPUDevice.createPipelineLayout()`.
 *
 * @private
 */
class GPUPipelineLayoutDescriptor {

	constructor() {

		/**
		 * The label of the pipeline layout.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The set of bind group layouts the pipeline layout describes.
		 *
		 * @type {?Array<?GPUBindGroupLayout>}
		 * @default null
		 */
		this.bindGroupLayouts = null;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.bindGroupLayouts = null;

	}

}

export default GPUPipelineLayoutDescriptor;
