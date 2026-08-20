import GPUTexelCopyTextureInfo from './GPUTexelCopyTextureInfo.js';

/**
 * Reusable descriptor for `GPUCopyExternalImageDestInfo`, the destination
 * argument to `GPUQueue.copyExternalImageToTexture()`.
 *
 * @private
 * @augments GPUTexelCopyTextureInfo
 */
class GPUCopyExternalImageDestInfo extends GPUTexelCopyTextureInfo {

	constructor() {

		super();

		/**
		 * The predefined color space the destination texture is interpreted in.
		 *
		 * @type {string}
		 * @default 'srgb'
		 */
		this.colorSpace = 'srgb';

		/**
		 * Whether the destination texture has premultiplied alpha.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.premultipliedAlpha = false;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		super.reset();
		this.colorSpace = 'srgb';
		this.premultipliedAlpha = false;

	}

}

export default GPUCopyExternalImageDestInfo;
