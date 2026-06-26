/**
 * Reusable descriptor for `GPUTexelCopyTextureInfo`, the texture side of
 * `GPUCommandEncoder.copyTextureToTexture()`, `copyTextureToBuffer()` and
 * `GPUQueue.writeTexture()`.
 *
 * @private
 */
class GPUTexelCopyTextureInfo {

	constructor() {

		/**
		 * The target texture.
		 *
		 * @type {?GPUTexture}
		 * @default null
		 */
		this.texture = null;

		/**
		 * The mipmap level of the texture.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.mipLevel = 0;

		/**
		 * The origin offset within the texture.
		 *
		 * @type {{x: number, y: number, z: number}}
		 */
		this.origin = { x: 0, y: 0, z: 0 };

		/**
		 * Which aspect of the texture is referenced.
		 *
		 * @type {string}
		 * @default 'all'
		 */
		this.aspect = 'all';

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.texture = null;
		this.mipLevel = 0;
		this.origin.x = 0;
		this.origin.y = 0;
		this.origin.z = 0;
		this.aspect = 'all';

	}

}

export default GPUTexelCopyTextureInfo;
