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
		this._texture = null;

		/**
		 * An event listener which is added to {@link texture}'s dispose event.
		 *
		 * @private
		 * @type {Function}
		 */
		this._onTextureDispose = () => {

			this.generation = null;
			this.version = - 1;

		};

		// Assignment to the texture via a setter must occur after "_onTextureDispose" is initialized.
		this.texture = texture;

		/**
		 * The binding's version.
		 *
		 * @type {number}
		 */
		this.version = texture ? texture.version : - 1;

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

		if ( this._texture ) {

			this._texture.removeEventListener( 'dispose', this._onTextureDispose );

		}

		this._texture = value;

		this.generation = null;
		this.version = - 1;

		if ( this._texture ) {

			this._texture.addEventListener( 'dispose', this._onTextureDispose );

		}

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


	clone() {

		const clonedSampler = super.clone();

		// fix dispose handler for cloned instances
		// TODO: Find better solution, see #31747

		clonedSampler._texture = null;

		clonedSampler._onTextureDispose = () => {

			clonedSampler.generation = null;
			clonedSampler.version = - 1;

		};

		clonedSampler.texture = this.texture;

		return clonedSampler;

	}

}

export default Sampler;
