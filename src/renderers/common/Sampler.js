import Binding from './Binding.js';

/**
 * Represents a sampler binding type.
 *
 * @private
 * @augments Binding
 */
class Sampler extends Binding {

	/**
	 * Constructs a new sampler.
	 *
	 * @param {string} name - The samplers's name.
	 * @param {?Texture} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name );

		/**
		 * The texture the sampler is referring to.
		 *
		 * @private
		 * @type {?Texture}
		 */
		this._texture = texture;

		/**
		 * The binding's version.
		 *
		 * @type {number}
		 */
		this.version = - 1;

		/**
		 * The binding's generation which is an additional version
		 * qualifier.
		 *
		 * @type {?number}
		 * @default null
		 */
		this.generation = null;

		/**
		 * The binding's sampler key.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.samplerKey = '';

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampler = true;

	}

	/**
	 * Sets the texture of this sampler.
	 *
	 * @param {Texture} value - The texture to set.
	 */
	set texture( value ) {

		if ( this._texture === value ) return;

		this._texture = value;

		this.reset();

	}

	/**
	 * Gets the texture of this sampler.
	 * @return {?Texture} The texture.
	 */
	get texture() {

		return this._texture;

	}

	/**
	 * Updates the binding.
	 *
	 * @return {boolean} Whether the texture has been updated and must be
	 * uploaded to the GPU.
	 */
	update() {

		const { texture, version } = this;

		if ( version !== texture.version ) {

			this.version = texture.version;

			return true;

		}

		return false;

	}

	/**
	 * Resets the version and generation. This is used when the texture
	 * the binding is pointing to is disposed or exchanged.
	 */
	reset() {

		this.generation = null;
		this.version = - 1;

	}

	/**
	 * Releases the texture reference.
	 */
	release() {

		this._texture = null;

	}

}

export default Sampler;
