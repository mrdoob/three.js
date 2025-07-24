import Sampler from './Sampler.js';

let _id = 0;

/**
 * Represents a sampled texture binding type.
 *
 * @private
 * @augments Binding
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
		 * The binding's generation which is an additional version
		 * qualifier.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.generation = null;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampledTexture = true;

	}

	/**
	 * Returns `true` whether this binding requires an update for the
	 * given generation.
	 *
	 * @param {number} generation - The generation.
	 * @return {boolean} Whether an update is required or not.
	 */
	needsBindingsUpdate( generation ) {

		if ( generation !== this.generation ) {

			this.generation = generation;

			return true;

		}

		return false;

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
