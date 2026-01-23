import { Texture } from './Texture.js';

/**
 * Creates a texture based on data in compressed form.
 *
 * These texture are usually loaded with {@link CompressedTextureLoader}.
 *
 * @augments Texture
 */
class CompressedTexture extends Texture {

	/**
	 * Constructs a new compressed texture.
	 *
	 * @param {Array<Object>} mipmaps - This array holds for all mipmaps (including the bases mip)
	 * the data and dimensions.
	 * @param {number} width - The width of the texture.
	 * @param {number} height - The height of the texture.
	 * @param {number} [format=RGBAFormat] - The texture format.
	 * @param {number} [type=UnsignedByteType] - The texture type.
	 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=LinearFilter] - The mag filter value.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - The min filter value.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [colorSpace=NoColorSpace] - The color space.
	 */
	constructor( mipmaps, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCompressedTexture = true;

		/**
		 * The image property of a compressed texture just defines its dimensions.
		 *
		 * @type {{width:number,height:number}}
		 */
		this.image = { width: width, height: height };

		/**
		 * This array holds for all mipmaps (including the bases mip) the data and dimensions.
		 *
		 * @type {Array<Object>}
		 */
		this.mipmaps = mipmaps;

		/**
		 * If set to `true`, the texture is flipped along the vertical axis when
		 * uploaded to the GPU.
		 *
		 * Overwritten and set to `false` by default since it is not possible to
		 * flip compressed textures.
		 *
		 * @type {boolean}
		 * @default false
		 * @readonly
		 */
		this.flipY = false;

		/**
		 * Whether to generate mipmaps (if possible) for a texture.
		 *
		 * Overwritten and set to `false` by default since it is not
		 * possible to generate mipmaps for compressed data. Mipmaps
		 * must be embedded in the compressed texture file.
		 *
		 * @type {boolean}
		 * @default false
		 * @readonly
		 */
		this.generateMipmaps = false;

	}

}

export { CompressedTexture };
