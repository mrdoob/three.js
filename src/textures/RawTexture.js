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
class RawTexture extends Texture {

	/**
	 * Creates a new raw texture.
	 *
	 * @param {?WebGLTexture} [sourceTexture=null] - The external texture.
	 * @param {boolean} [opaque=false] - Whether the texture should be treated as read-only.
	 */
	constructor( sourceTexture = null, opaque = false ) {

		super();

		/**
		 * The external source texture.
		 *
		 * @type {?WebGLTexture}
		 * @default null
		 */
		this.sourceTexture = sourceTexture;

		/**
		 * Whether the texture should be treated as read-only.
		 *
		 * @type {boolean}
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
