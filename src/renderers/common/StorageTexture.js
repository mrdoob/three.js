import { Texture } from '../../textures/Texture.js';
import { LinearFilter } from '../../constants.js';

/**
 * This special type of texture is intended for compute shaders.
 * It can be used to compute the data of a texture with a compute shader.
 *
 * Note: This type of texture can only be used with `WebGPURenderer`
 * and a WebGPU backend.
 *
 * @augments Texture
 */
class StorageTexture extends Texture {

	/**
	 * Constructs a new storage texture.
	 *
	 * @param {Number} [width=1] - The storage texture's width.
	 * @param {Number} [height=1] - The storage texture's height.
	 */
	constructor( width = 1, height = 1 ) {

		super();

		/**
		 * The image object which just represents the texture's dimension.
		 *
		 * @type {{width: Number, height: Number}}
		 */
		this.image = { width, height };

		/**
		 * The default `magFilter` for storage textures is `THREE.LinearFilter`.
		 *
		 * @type {Number}
		 */
		this.magFilter = LinearFilter;

		/**
		 * The default `minFilter` for storage textures is `THREE.LinearFilter`.
		 *
		 * @type {Number}
		 */
		this.minFilter = LinearFilter;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageTexture = true;

	}

}

export default StorageTexture;
