import { RenderTarget } from './RenderTarget.js';
import { Data3DTexture } from '../textures/Data3DTexture.js';

/**
 * Represents a 3D render target.
 *
 * @augments RenderTarget
 */
class RenderTarget3D extends RenderTarget {

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
		this.isRenderTarget3D = true;

		this.depth = depth;

		// overwrite attachments with 3D textures

		for ( let i = 0; i < this.textures.length; i ++ ) {

			const texture = new Data3DTexture( null, width, height, depth );
			texture.isRenderTargetTexture = true;
			texture.renderTarget = this;

			this.textures[ i ] = texture;

		}

		this._setTextureOptions( options );

	}

}

export { RenderTarget3D };
