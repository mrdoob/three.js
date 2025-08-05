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
		 * This function is called when the texture is disposed.
		 * @type {function}
		 * @private
		 */
		this._onDisposeTexture = () => {

			this.texture = null;

		};

		/**
		 * The texture the sampler is referring to.
		 *
		 * @type {?Texture}
		 */
		this.texture = texture;

		/**
		 * The binding's version.
		 *
		 * @type {number}
		 */
		this.version = texture ? texture.version : 0;

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
		this.isSampler = true;

	}

	/**
	 * Sets the texture of this sampler.
	 * @param {?Texture} value - The texture to set.
	 */
	set texture( value ) {

		if ( this._texture === value ) return;

		if ( this._texture ) {

			this._texture.removeEventListener( 'dispose', this._onDisposeTexture );

		}

		this._texture = value;

		this.generation = null;
		this.version = 0;

		if ( this._texture ) {

			this._texture.addEventListener( 'dispose', this._onDisposeTexture );

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

}

export default Sampler;
