/**
 * Reusable descriptor for `GPUCommandEncoder.beginRenderPass()`.
 *
 * @private
 */
class GPURenderPassDescriptor {

	constructor() {

		/**
		 * The label of the render pass.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The color attachments of the render pass.
		 *
		 * @type {Array<?Object>}
		 */
		this.colorAttachments = [];

		/**
		 * The depth-stencil attachment of the render pass.
		 *
		 * @type {Object|undefined}
		 */
		this.depthStencilAttachment = undefined;

		/**
		 * The query set used for occlusion queries during the pass.
		 *
		 * @type {?GPUQuerySet|undefined}
		 */
		this.occlusionQuerySet = undefined;

		/**
		 * Defines which timestamp values are written and where.
		 *
		 * @type {Object|undefined}
		 */
		this.timestampWrites = undefined;

		/**
		 * The maximum number of draw calls that can be issued during the pass.
		 *
		 * @type {number}
		 * @default 50000000
		 */
		this.maxDrawCount = 50000000;

	}

	/**
	 * Resets the descriptor to its default state. The internal `colorAttachments`
	 * array is emptied without releasing its backing storage.
	 */
	reset() {

		this.label = '';
		this.colorAttachments.length = 0;
		this.depthStencilAttachment = undefined;
		this.occlusionQuerySet = undefined;
		this.timestampWrites = undefined;
		this.maxDrawCount = 50000000;

	}

}

export default GPURenderPassDescriptor;
