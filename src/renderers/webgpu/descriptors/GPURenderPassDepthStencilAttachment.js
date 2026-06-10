/**
 * Reusable descriptor for `GPURenderPassDepthStencilAttachment`, the
 * `depthStencilAttachment` field of `GPURenderPassDescriptor`.
 *
 * @private
 */
class GPURenderPassDepthStencilAttachment {

	constructor() {

		/**
		 * The depth/stencil texture view the pass renders into.
		 *
		 * @type {?GPUTextureView}
		 * @default null
		 */
		this.view = null;

		/**
		 * The load operation applied to the depth aspect at the start of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.depthLoadOp = undefined;

		/**
		 * The store operation applied to the depth aspect at the end of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.depthStoreOp = undefined;

		/**
		 * The clear value used when `depthLoadOp` is `'clear'`.
		 *
		 * @type {number|undefined}
		 */
		this.depthClearValue = undefined;

		/**
		 * Whether the depth aspect is read-only.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.depthReadOnly = false;

		/**
		 * The load operation applied to the stencil aspect at the start of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.stencilLoadOp = undefined;

		/**
		 * The store operation applied to the stencil aspect at the end of the pass.
		 *
		 * @type {string|undefined}
		 */
		this.stencilStoreOp = undefined;

		/**
		 * The clear value used when `stencilLoadOp` is `'clear'`.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.stencilClearValue = 0;

		/**
		 * Whether the stencil aspect is read-only.
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

		this.view = null;
		this.depthLoadOp = undefined;
		this.depthStoreOp = undefined;
		this.depthClearValue = undefined;
		this.depthReadOnly = false;
		this.stencilLoadOp = undefined;
		this.stencilStoreOp = undefined;
		this.stencilClearValue = 0;
		this.stencilReadOnly = false;

	}

}

export default GPURenderPassDepthStencilAttachment;
