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
	 * @param {String} name - The samplers's name.
	 * @param {Texture?} texture - The texture this binding is referring to.
	 */
	constructor( name, texture ) {

		super( name );

		/**
		 * The texture the sampler is referring to.
		 *
		 * @type {Texture?}
		 */
		this.texture = texture;

		/**
		 * The binding's version.
		 *
		 * @type {Number}
		 */
		this.version = texture ? texture.version : 0;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampler = true;

	}

}

export default Sampler;
