import { Texture } from './Texture.js';
import { NearestFilter } from '../constants.js';

/**
 * Creates a texture directly from raw buffer data.
 *
 * The interpretation of the data depends on type and format: If the type is
 * `UnsignedByteType`, a `Uint8Array` will be useful for addressing the
 * texel data. If the format is `RGBAFormat`, data needs four values for
 * one texel; Red, Green, Blue and Alpha (typically the opacity).
 *
 * @augments Texture
 */
class DataTexture extends Texture {

	/**
	 * Constructs a new data texture.
	 *
	 * @param {?TypedArray} [data=null] - The buffer data.
	 * @param {number} [width=1] - The width of the texture.
	 * @param {number} [height=1] - The height of the texture.
	 * @param {number} [format=RGBAFormat] - The texture format.
	 * @param {number} [type=UnsignedByteType] - The texture type.
	 * @param {number} [mapping=Texture.DEFAULT_MAPPING] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - The wrapS value.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - The wrapT value.
	 * @param {number} [magFilter=NearestFilter] - The mag filter value.
	 * @param {number} [minFilter=NearestFilter] - The min filter value.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - The anisotropy value.
	 * @param {string} [colorSpace=NoColorSpace] - The color space.
	 */
	constructor( data = null, width = 1, height = 1, format, type, mapping, wrapS, wrapT, magFilter = NearestFilter, minFilter = NearestFilter, anisotropy, colorSpace ) {

		super( null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDataTexture = true;

		/**
		 * The image definition of a data texture.
		 *
		 * @type {{data:TypedArray,width:number,height:number}}
		 */
		this.image = { data: data, width: width, height: height };

		/**
		 * Whether to generate mipmaps (if possible) for a texture.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.generateMipmaps = false;

		/**
		 * If set to `true`, the texture is flipped along the vertical axis when
		 * uploaded to the GPU.
		 *
		 * Overwritten and set to `false` by default.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.flipY = false;

		/**
		 * Specifies the alignment requirements for the start of each pixel row in memory.
		 *
		 * Overwritten and set to `1` by default.
		 *
		 * @type {boolean}
		 * @default 1
		 */
		this.unpackAlignment = 1;

	}

}

export { DataTexture };
