import { WebGLRenderTarget } from './WebGLRenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture.js';

/**
 * A 3D render target used in context of {@link WebGLRenderer}.
 *
 * @augments WebGLRenderTarget
 */
class WebGL3DRenderTarget extends WebGLRenderTarget {

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

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isWebGL3DRenderTarget = true;

		this.depth = depth;

		/**
		 * Overwritten with a different texture type.
		 *
		 * @type {Data3DTexture}
		 */
		this.texture = new Data3DTexture( null, width, height, depth );

		this.texture.isRenderTargetTexture = true;

	}

}

export { WebGL3DRenderTarget };
