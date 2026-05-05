/**
 * Reusable descriptor for `GPUDevice.createSampler()`.
 *
 * @private
 */
class GPUSamplerDescriptor {

	constructor() {

		/**
		 * The label of the sampler.
		 *
		 * @type {string}
		 */
		this.label = '';

		/**
		 * The address mode for the sampler's U coordinate.
		 *
		 * @type {string}
		 * @default 'clamp-to-edge'
		 */
		this.addressModeU = 'clamp-to-edge';

		/**
		 * The address mode for the sampler's V coordinate.
		 *
		 * @type {string}
		 * @default 'clamp-to-edge'
		 */
		this.addressModeV = 'clamp-to-edge';

		/**
		 * The address mode for the sampler's W coordinate.
		 *
		 * @type {string}
		 * @default 'clamp-to-edge'
		 */
		this.addressModeW = 'clamp-to-edge';

		/**
		 * The magnification filter mode.
		 *
		 * @type {string}
		 * @default 'nearest'
		 */
		this.magFilter = 'nearest';

		/**
		 * The minification filter mode.
		 *
		 * @type {string}
		 * @default 'nearest'
		 */
		this.minFilter = 'nearest';

		/**
		 * The mipmap filter mode.
		 *
		 * @type {string}
		 * @default 'nearest'
		 */
		this.mipmapFilter = 'nearest';

		/**
		 * The minimum level of detail used to sample.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.lodMinClamp = 0;

		/**
		 * The maximum level of detail used to sample.
		 *
		 * @type {number}
		 * @default 32
		 */
		this.lodMaxClamp = 32;

		/**
		 * The compare function used by the sampler.
		 *
		 * @type {string|undefined}
		 */
		this.compare = undefined;

		/**
		 * The maximum allowed anisotropic filtering.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.maxAnisotropy = 1;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.label = '';
		this.addressModeU = 'clamp-to-edge';
		this.addressModeV = 'clamp-to-edge';
		this.addressModeW = 'clamp-to-edge';
		this.magFilter = 'nearest';
		this.minFilter = 'nearest';
		this.mipmapFilter = 'nearest';
		this.lodMinClamp = 0;
		this.lodMaxClamp = 32;
		this.compare = undefined;
		this.maxAnisotropy = 1;

	}

}

export default GPUSamplerDescriptor;
