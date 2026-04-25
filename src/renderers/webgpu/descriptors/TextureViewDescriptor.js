/**
 * Reusable wrapper around `GPUTextureViewDescriptor`. Mutated in place at call
 * sites to avoid per-frame GC pressure when creating texture views.
 *
 * @private
 */
class TextureViewDescriptor {

	/**
	 * Constructs a new texture view descriptor with permissive defaults so an
	 * unset field maps to the WebGPU default (e.g. "all mip levels").
	 */
	constructor() {

		/**
		 * The debug label.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The first mip level visible to the view.
		 *
		 * @type {number}
		 */
		this.baseMipLevel = 0;

		/**
		 * The number of mip levels visible to the view (undefined = all remaining).
		 *
		 * @type {number|undefined}
		 */
		this.mipLevelCount = undefined;

		/**
		 * The first array layer visible to the view.
		 *
		 * @type {number}
		 */
		this.baseArrayLayer = 0;

		/**
		 * The number of array layers visible to the view (undefined = all remaining).
		 *
		 * @type {number|undefined}
		 */
		this.arrayLayerCount = undefined;

		/**
		 * The view dimension.
		 *
		 * @type {string|undefined}
		 */
		this.dimension = undefined;

		/**
		 * Renderer-internal annotation propagated alongside the view descriptor;
		 * ignored by `createView()` itself.
		 *
		 * @type {number|undefined}
		 */
		this.depthOrArrayLayers = undefined;

	}

}

export default TextureViewDescriptor;
