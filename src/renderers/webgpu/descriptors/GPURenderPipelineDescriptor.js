/**
 * Reusable descriptor for `GPUDevice.createRenderPipeline()` and
 * `createRenderPipelineAsync()`.
 *
 * @private
 */
class GPURenderPipelineDescriptor {

	constructor() {

		/**
		 * The label of the render pipeline.
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
		 * The programmable vertex stage.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.vertex = null;

		/**
		 * The primitive-assembly state.
		 *
		 * @type {Object}
		 */
		this.primitive = {};

		/**
		 * The depth/stencil state, omitted when the pipeline has no depth or stencil aspect.
		 *
		 * @type {Object|undefined}
		 */
		this.depthStencil = undefined;

		/**
		 * The multisample state.
		 *
		 * @type {GPUMultisampleState}
		 */
		this.multisample = new GPUMultisampleState();

		/**
		 * The programmable fragment stage. Omitted for vertex-only pipelines.
		 *
		 * @type {?Object}
		 * @default null
		 */
		this.fragment = null;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.layout = null;
		this.vertex = null;
		this.primitive = {};
		this.depthStencil = undefined;
		this.multisample.reset();
		this.fragment = null;

	}

}

/**
 * Reusable nested state for `GPURenderPipelineDescriptor.multisample`.
 *
 * @private
 */
class GPUMultisampleState {

	constructor() {

		/**
		 * The number of samples per pixel.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.count = 1;

		/**
		 * A bitmask determining which samples are written to.
		 *
		 * @type {number}
		 * @default 0xFFFFFFFF
		 */
		this.mask = 0xFFFFFFFF;

		/**
		 * Whether a fragment's alpha channel is used to generate a sample coverage mask.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.alphaToCoverageEnabled = false;

	}

	/**
	 * Resets the state to its default values.
	 */
	reset() {

		this.count = 1;
		this.mask = 0xFFFFFFFF;
		this.alphaToCoverageEnabled = false;

	}

}

export default GPURenderPipelineDescriptor;
