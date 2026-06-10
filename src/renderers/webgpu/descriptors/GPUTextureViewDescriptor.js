/**
 * Reusable descriptor for `GPUTexture.createView()`.
 *
 * @private
 */
class GPUTextureViewDescriptor {

	constructor() {

		/**
		 * The label of the texture view.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The format of the texture view.
		 *
		 * @type {string|undefined}
		 */
		this.format = undefined;

		/**
		 * The dimension of the texture view.
		 *
		 * @type {string|undefined}
		 */
		this.dimension = undefined;

		/**
		 * The allowed usages for the texture view.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.usage = 0;

		/**
		 * Which aspect of the texture is referenced.
		 *
		 * @type {string}
		 * @default 'all'
		 */
		this.aspect = 'all';

		/**
		 * The first mip level accessible to the texture view.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.baseMipLevel = 0;

		/**
		 * The number of mip levels accessible to the texture view.
		 *
		 * @type {number|undefined}
		 */
		this.mipLevelCount = undefined;

		/**
		 * The first array layer accessible to the texture view.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.baseArrayLayer = 0;

		/**
		 * The number of array layers accessible to the texture view.
		 *
		 * @type {number|undefined}
		 */
		this.arrayLayerCount = undefined;

		/**
		 * The component swizzle to apply when sampling the texture view.
		 * Requires the `'texture-component-swizzle'` feature; ignored otherwise.
		 *
		 * @type {string}
		 * @default 'rgba'
		 */
		this.swizzle = 'rgba';

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.format = undefined;
		this.dimension = undefined;
		this.usage = 0;
		this.aspect = 'all';
		this.baseMipLevel = 0;
		this.mipLevelCount = undefined;
		this.baseArrayLayer = 0;
		this.arrayLayerCount = undefined;
		this.swizzle = 'rgba';

	}

}

export default GPUTextureViewDescriptor;
