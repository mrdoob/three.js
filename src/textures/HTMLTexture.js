import { Texture } from './Texture.js';

/**
 * Creates a texture from an HTML element.
 *
 * This is almost the same as the base texture class, except that it sets {@link Texture#needsUpdate}
 * to `true` immediately and listens for the parent canvas's paint events to trigger updates.
 *
 * @augments Texture
 */
class HTMLTexture extends Texture {

	/**
	 * Constructs a new texture.
	 *
	 * @param {HTMLElement} [element] - The HTML element.
	 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [format=RGBAFormat] - The texture format.
	 * @param {number} [type=UnsignedByteType] - The texture type.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 */
	constructor( element, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy ) {

		super( element, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isHTMLTexture = true;
		this.generateMipmaps = false;

		this.needsUpdate = true;

		const parent = element ? element.parentNode : null;

		if ( parent !== null && 'requestPaint' in parent ) {

			parent.onpaint = () => {

				this.needsUpdate = true;

			};

			parent.requestPaint();

		}

	}

	dispose() {

		const parent = this.image ? this.image.parentNode : null;

		if ( parent !== null && 'onpaint' in parent ) {

			parent.onpaint = null;

		}

		super.dispose();

	}

}

export { HTMLTexture };
