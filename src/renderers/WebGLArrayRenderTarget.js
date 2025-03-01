import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { DataArrayTexture } from '../textures/DataArrayTexture.js';

/**
 * An array render target used in context of {@link WebGLRenderer}.
 *
 * @augments WebGLRenderTarget
 */
class WebGLArrayRenderTarget extends WebGLRenderTarget {

	/**
	 * Constructs a new array render target.
	 *
	 * @param {number} [width=1] - The width of the render target.
	 * @param {number} [height=1] - The height of the render target.
	 * @param {number} [depth=1] - The height of the render target.
	 * @param {RenderTarget~Options} [options] - The configuration object.
	 */
	constructor( width = 1, height = 1, depth = 1, options = {} ) {

		super( width, height, options );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGLArrayRenderTarget = true;

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

export { WebGLArrayRenderTarget };
