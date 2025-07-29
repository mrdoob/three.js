import { Texture } from './Texture.js';

/**
 * A texture created externally from the renderer context.
 *
 * This may be a texture from a protected media stream, device camera feed,
 * or other data feeds like a depth sensor.
 *
 * @augments Texture
 */
class RawTexture extends Texture {

	/**
	 *
	 * @param {*} sourceTexture The external texture. in WebGL, this is a WebGLTexture object.
	 * @param {boolean} opaque Whether the texture should be treated as read-only.
	 */
	constructor( sourceTexture = null, opaque = false ) {

		super();

		/**
		 * The external source texture
		 */
		this.sourceTexture = sourceTexture;

		/**
		 * Whether the texture should be treated as read-only.
		 * @default false
		 */
		this.opaque = opaque;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isRawTexture = true;

	}

}

export { RawTexture };
