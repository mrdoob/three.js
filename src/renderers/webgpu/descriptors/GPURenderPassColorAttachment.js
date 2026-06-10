/**
 * Reusable descriptor for `GPURenderPassColorAttachment`, the type of each
 * entry in `GPURenderPassDescriptor.colorAttachments`.
 *
 * @private
 */
class GPURenderPassColorAttachment {

	constructor() {

		/**
		 * The texture view the pass renders into.
		 *
		 * @type {?GPUTextureView}
		 * @default null
		 */
		this.view = null;

		/**
		 * The depth slice the pass renders into.
		 *
		 * @type {number|undefined}
		 */
		this.depthSlice = undefined;

		/**
		 * The texture view that receives the resolved output of multisampled rendering.
		 *
		 * @type {?GPUTextureView|undefined}
		 */
		this.resolveTarget = undefined;

		/**
		 * The clear value used when `loadOp` is `'clear'`.
		 *
		 * @type {Object|undefined}
		 */
		this.clearValue = undefined;

		/**
		 * The load operation performed at the start of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.loadOp = undefined;

		/**
		 * The store operation performed at the end of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.storeOp = undefined;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.view = null;
		this.depthSlice = undefined;
		this.resolveTarget = undefined;
		this.clearValue = undefined;
		this.loadOp = undefined;
		this.storeOp = undefined;

	}

}

export default GPURenderPassColorAttachment;
