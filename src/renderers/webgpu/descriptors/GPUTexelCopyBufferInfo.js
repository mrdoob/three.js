/**
 * Reusable descriptor for `GPUTexelCopyBufferInfo`, the buffer side of
 * `GPUCommandEncoder.copyTextureToBuffer()` and `copyBufferToTexture()`.
 *
 * @private
 */
class GPUTexelCopyBufferInfo {

	constructor() {

		/**
		 * The target buffer.
		 *
		 * @type {?GPUBuffer}
		 * @default null
		 */
		this.buffer = null;

		/**
		 * The byte offset within the buffer where the texel data begins.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.offset = 0;

		/**
		 * The stride, in bytes, between rows of texel blocks.
		 *
		 * @type {number|undefined}
		 */
		this.bytesPerRow = undefined;

		/**
		 * The number of texel block rows per single image of the texture.
		 *
		 * @type {number|undefined}
		 */
		this.rowsPerImage = undefined;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.buffer = null;
		this.offset = 0;
		this.bytesPerRow = undefined;
		this.rowsPerImage = undefined;

	}

}

export default GPUTexelCopyBufferInfo;
