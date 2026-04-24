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
	 * @param {number} [width=1] - The storage texture's width.
	 * @param {number} [height=1] - The storage texture's height.
	 */
	constructor( width = 1, height = 1 ) {

		super();

		/**
		 * The image object which just represents the texture's dimension.
		 *
		 * @type {{width: number, height: number}}
		 */
		this.image = { width, height };

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

		/**
		 * When `true`, mipmaps will be auto-generated after compute writes.
		 * When `false`, mipmaps must be written manually via compute shaders.
		 *
		 * @type {boolean}
		 * @default true
		 */
		this.mipmapsAutoUpdate = true;

	}
	/**
	 * Sets the size of the storage texture.
	 *
	 * @param {number} width - The new width of the storage texture.
	 * @param {number} height - The new height of the storage texture.
	 */
	setSize( width, height ) {

		if ( this.image.width !== width || this.image.height !== height ) {

			this.image.width = width;
			this.image.height = height;

			this.dispose();

		}

	}

}

export default StorageTexture;
