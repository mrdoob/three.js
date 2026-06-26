/**
 * Reusable descriptor for `GPUTexelCopyBufferLayout`, the data-layout argument
 * to `GPUQueue.writeTexture()`.
 *
 * @private
 */
class GPUTexelCopyBufferLayout {

	constructor() {

		/**
		 * The byte offset within the source data where the texel data begins.
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

		this.offset = 0;
		this.bytesPerRow = undefined;
		this.rowsPerImage = undefined;

	}

}

export default GPUTexelCopyBufferLayout;
