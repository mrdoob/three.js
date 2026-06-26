import { CubeReflectionMapping } from '../constants.js';
import { CompressedTexture } from './CompressedTexture.js';

/**
 * Creates a cube texture based on data in compressed form.
 *
 * These texture are usually loaded with {@link CompressedTextureLoader}.
 *
 * @augments CompressedTexture
 */
class CompressedCubeTexture extends CompressedTexture {

	/**
	 * Constructs a new compressed texture.
	 *
	 * @param {Array<CompressedTexture>} images - An array of compressed textures.
	 * @param {number} [format=RGBAFormat] - The texture format.
	 * @param {number} [type=UnsignedByteType] - The texture type.
	 */
	constructor( images, format, type ) {

		super( undefined, images[ 0 ].width, images[ 0 ].height, format, type, CubeReflectionMapping );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCompressedCubeTexture = true;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isCubeTexture = true;

		this.image = images;

	}

}

export { CompressedCubeTexture };
