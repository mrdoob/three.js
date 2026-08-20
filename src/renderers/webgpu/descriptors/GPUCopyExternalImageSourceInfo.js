/**
 * Reusable descriptor for `GPUCopyExternalImageSourceInfo`, the source argument
 * to `GPUQueue.copyExternalImageToTexture()`.
 *
 * @private
 */
class GPUCopyExternalImageSourceInfo {

	constructor() {

		/**
		 * The image-like source.
		 *
		 * @type {?(ImageBitmap|ImageData|HTMLImageElement|HTMLVideoElement|VideoFrame|HTMLCanvasElement|OffscreenCanvas)}
		 * @default null
		 */
		this.source = null;

		/**
		 * The origin offset within the source.
		 *
		 * @type {{x: number, y: number}}
		 */
		this.origin = { x: 0, y: 0 };

		/**
		 * Whether the source is flipped vertically before copying.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.flipY = false;

	}

	/**
	 * Resets the descriptor to its default state.
	 */
	reset() {

		this.source = null;
		this.origin.x = 0;
		this.origin.y = 0;
		this.flipY = false;

	}

}

export default GPUCopyExternalImageSourceInfo;
