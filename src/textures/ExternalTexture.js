import { Texture } from './Texture.js';

/**
 * Represents a texture created externally from the renderer context.
 *
 * This may be a texture from a protected media stream, device camera feed,
 * or other data feeds like a depth sensor.
 *
 * Note that this class is only supported in {@link WebGLRenderer} right now.
 *
 * @augments Texture
 */
class ExternalTexture extends Texture {

	/**
	 * Creates a new raw texture.
	 *
	 * @param {?WebGLTexture} [sourceTexture=null] - The external texture.
	 */
	constructor( sourceTexture = null ) {

		super();

		/**
		 * The external source texture.
		 *
		 * @type {?WebGLTexture}
		 * @default null
		 */
		this.sourceTexture = sourceTexture;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isExternalTexture = true;

	}

}

export { ExternalTexture };
