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
class StorageArrayTexture extends Texture {

	/**
	 * Constructs a new storage texture.
	 *
	 * @param {number} [width=1] - The storage texture's width.
	 * @param {number} [height=1] - The storage texture's height.
	 * @param {number} [depth=1] - The storage texture's depth.
	 */
	constructor( width = 1, height = 1, depth = 1 ) {

		super();

		//inherited from texture
		this.isArrayTexture = true;

		/**
		 * The image object which just represents the texture's dimension.
		 *
		 * @type {{width: number, height: number, depth: number}}
		 */
		this.image = { width, height, depth };

		/**
		 * The default `magFilter` for storage textures is `THREE.LinearFilter`.
		 *
		 * @type {number}
		 */
		this.magFilter = LinearFilter;

		/**
		 * The default `minFilter` for storage textures is `THREE.LinearFilter`.
		 *
		 * @type {number}
		 */
		this.minFilter = LinearFilter;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isStorageTexture = true;

	}

}

export default StorageArrayTexture;
