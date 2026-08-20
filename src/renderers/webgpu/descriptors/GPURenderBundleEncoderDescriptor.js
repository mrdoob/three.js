/**
 * Reusable descriptor for `GPUDevice.createRenderBundleEncoder()`.
 *
 * @private
 */
class GPURenderBundleEncoderDescriptor {

	constructor() {

		/**
		 * The label of the render bundle encoder.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The formats of the color attachments the bundle is compatible with.
		 *
		 * @type {?Array<?string>}
		 * @default null
		 */
		this.colorFormats = null;

		/**
		 * The format of the depth/stencil attachment the bundle is compatible with.
		 *
		 * @type {string|undefined}
		 */
		this.depthStencilFormat = undefined;

		/**
		 * The number of samples per pixel the bundle is compatible with.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.sampleCount = 1;

		/**
		 * Whether the depth attachment is read-only.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.depthReadOnly = false;

		/**
		 * Whether the stencil attachment is read-only.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.stencilReadOnly = false;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.colorFormats = null;
		this.depthStencilFormat = undefined;
		this.sampleCount = 1;
		this.depthReadOnly = false;
		this.stencilReadOnly = false;

	}

}

export default GPURenderBundleEncoderDescriptor;
