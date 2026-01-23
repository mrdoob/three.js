import { Texture } from './Texture.js';

/**
 * Creates a texture from a canvas element.
 *
 * This is almost the same as the base texture class, except that it sets {@link Texture#needsUpdate}
 * to `true` immediately since a canvas can directly be used for rendering.
 *
 * @augments Texture
 */
class CanvasTexture extends Texture {

	/**
	 * Constructs a new texture.
	 *
	 * @param {HTMLCanvasElement} [canvas] - The HTML canvas element.
	 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The texture format.
	 * @param {number} [type=UnsignedByteType] - The texture type.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( canvas, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCanvasTexture = true;

		this.needsUpdate = true;

	}

}

export { CanvasTexture };
