import { Texture } from './Texture.js';
import { CubeReflectionMapping } from '../constants.js';

/**
 * An array of cubemaps. Each entry contains six faces in +X, -X, +Y, -Y, +Z, -Z order,
 * like the images of a {@link CubeTexture}. All faces must be square and have the same size.
 * Sample a cube with `cubeTexture( texture, direction ).depth( cubeIndex )`.
 *
 * Set `needsUpdate` after all faces have loaded. Like CubeTexture, explicit
 * mipmaps are supplied as `{ images: cubemaps }` entries excluding the base level.
 * Each mip level must contain the same cubes, with face dimensions halved per level.
 * DataTexture faces must match the array type, format and color space.
 * Dispose the texture before changing its dimensions or number of cubes.
 *
 * Only supported by the WebGPU backend of {@link WebGPURenderer}.
 *
 * @augments Texture
 */
class CubeArrayTexture extends Texture {

	/**
	 * @param {Array<Array<Image|DataTexture>>} [images=[]] - The cubemaps, each with six faces.
	 * @param {number} [mapping=CubeReflectionMapping] - The texture mapping.
	 * @param {number} [wrapS=ClampToEdgeWrapping] - Horizontal wrapping.
	 * @param {number} [wrapT=ClampToEdgeWrapping] - Vertical wrapping.
	 * @param {number} [magFilter=LinearFilter] - Magnification filter.
	 * @param {number} [minFilter=LinearMipmapLinearFilter] - Minification filter.
	 * @param {number} [format=RGBAFormat] - Pixel format.
	 * @param {number} [type=UnsignedByteType] - Pixel type.
	 * @param {number} [anisotropy=Texture.DEFAULT_ANISOTROPY] - Anisotropy.
	 * @param {string} [colorSpace=NoColorSpace] - Color space.
	 */
	constructor( images = [], mapping = CubeReflectionMapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace ) {

		super( images, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, colorSpace );

		/**
		 * This flag can be used for type testing.
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeArrayTexture = true;
		this.flipY = false;

	}

	/** The cubemap images. Render-target textures instead use an allocation descriptor. @type {Array<Array<Image|DataTexture>>|Object} */
	get images() {

		return this.image;

	}

	set images( value ) {

		this.image = value;

	}

	/**
	 * The number of cubemaps. Render-target allocation descriptors count face layers.
	 *
	 * @type {number}
	 * @readonly
	 */
	get depth() {

		return Array.isArray( this.image ) ? this.image.length : this.image.depth / 6;

	}

}

export { CubeArrayTexture };
