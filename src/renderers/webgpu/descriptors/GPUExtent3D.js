/**
 * Reusable descriptor for `GPUExtent3D` in its dictionary form, used by
 * `GPUQueue.writeTexture()`, `GPUQueue.copyExternalImageToTexture()` and
 * the various `GPUCommandEncoder` copy methods.
 *
 * @private
 */
class GPUExtent3D {

	constructor() {

		/**
		 * The width of the extent.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.width = 0;

		/**
		 * The height of the extent.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.height = 1;

		/**
		 * The depth (for 3D textures) or number of array layers.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.depthOrArrayLayers = 1;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.width = 0;
		this.height = 1;
		this.depthOrArrayLayers = 1;

	}

}

export default GPUExtent3D;
