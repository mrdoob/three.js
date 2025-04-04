import { RenderTarget } from './RenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

/**
 * Represents an array render target.
 *
 * @augments RenderTarget
 */
class RenderTargetArray extends RenderTarget {

	/**
	 * Constructs a new 3D render target.
	 *
	 * @param {number} [width=1] - The width of the render target.
	 * @param {number} [height=1] - The height of the render target.
	 * @param {number} [depth=1] - The height of the render target.
	 * @param {RenderTarget~Options} [options] - The configuration object.
	 */
	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		this.isRenderTargetArray = true;

		this.depth = depth;

		/**
		 * Overwritten with a different texture type.
		 *
		 * @type {DataArrayTexture}
		 */
		this.texture = new DataArrayTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

export { RenderTargetArray };
