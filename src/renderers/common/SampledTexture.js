import Sampler from './Sampler.js';

let _id = 0;

/**
 * Represents a sampled texture binding type.
 *
 * @private
 * @augments Sampler
 */
class SampledTexture extends Sampler {

	/**
	 * Constructs a new sampled texture.
	 *
	 * @param {string} name - The sampled texture's name.
	 * @param {?Texture} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name, texture );

		/**
		 * This identifier.
		 *
		 * @type {number}
		 */
		this.id = _id ++;

		/**
		 * Whether the texture is a storage texture or not.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.store = false;

		/**
		 * The mip level to bind for storage textures.
		 *
		 * @type {number}
		 * @default 0
		 */
		this.mipLevel = 0;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledTexture = true;

	}

}

/**
 * Represents a sampled array texture binding type.
 *
 * @private
 * @augments SampledTexture
 */
class SampledArrayTexture extends SampledTexture {

	/**
	 * Constructs a new sampled array texture.
	 *
	 * @param {string} name - The sampled array texture's name.
	 * @param {?(DataArrayTexture|CompressedArrayTexture)} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name, texture );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledArrayTexture = true;

	}

}

/**
 * Represents a sampled 3D texture binding type.
 *
 * @private
 * @augments SampledTexture
 */
class Sampled3DTexture extends SampledTexture {

	/**
	 * Constructs a new sampled 3D texture.
	 *
	 * @param {string} name - The sampled 3D texture's name.
	 * @param {?Data3DTexture} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name, texture );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampled3DTexture = true;

	}

}

/**
 * Represents a sampled cube texture binding type.
 *
 * @private
 * @augments SampledTexture
 */
class SampledCubeTexture extends SampledTexture {

	/**
	 * Constructs a new sampled cube texture.
	 *
	 * @param {string} name - The sampled cube texture's name.
	 * @param {?(CubeTexture|CompressedCubeTexture)} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name, texture );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledCubeTexture = true;

	}

}

export { SampledTexture, SampledArrayTexture, Sampled3DTexture, SampledCubeTexture };
