/**
 * Reusable descriptor for `GPUDevice.createComputePipeline()`.
 *
 * @private
 */
class GPUComputePipelineDescriptor {

	constructor() {

		/**
		 * The label of the compute pipeline.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The pipeline layout the pipeline conforms to, or `'auto'`.
		 *
		 * @type {?GPUPipelineLayout|string}
		 * @default null
		 */
		this.layout = null;

		/**
		 * The programmable compute stage.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.compute = null;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.layout = null;
		this.compute = null;

	}

}

export default GPUComputePipelineDescriptor;
