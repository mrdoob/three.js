/**
 * Reusable wrapper around `GPURenderPassDescriptor`. Mutated in place at call
 * sites to avoid per-frame GC pressure when starting render passes.
 *
 * @private
 */
class RenderPassDescriptor {

	/**
	 * Constructs a new render pass descriptor.
	 */
	constructor() {

		/**
		 * Color attachments for the render pass.
		 *
		 * @type {?Array<GPURenderPassColorAttachment>}
		 * @default null
		 */
		this.colorAttachments = null;

		/**
		 * The depth/stencil attachment for the render pass.
		 *
		 * @type {?GPURenderPassDepthStencilAttachment}
		 * @default null
		 */
		this.depthStencilAttachment = null;

	}

}

export default RenderPassDescriptor;
