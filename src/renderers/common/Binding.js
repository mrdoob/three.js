/**
 * A binding represents the connection between a resource (like a texture, sampler
 * or uniform buffer) and the resource definition in a shader stage.
 *
 * This module is an abstract base class for all concrete bindings types.
 *
 * @abstract
 * @private
 */
class Binding {

	/**
	 * Constructs a new binding.
	 *
	 * @param {String} [name=''] - The binding's name.
	 */
	constructor( name = '' ) {

		/**
		 * The binding's name.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * A bitmask that defines in what shader stages the
		 * binding's resource is accessible.
		 *
		 * @type {Number}
		 */
		this.visibility = 0;

	}

	/**
	 * Makes sure binding's resource is visible for the given shader stage.
	 *
	 * @param {Number} visibility - The shader stage.
	 */
	setVisibility( visibility ) {

		this.visibility |= visibility;

	}

	/**
	 * Clones the binding.
	 *
	 * @return {Binding} The cloned binding.
	 */
	clone() {

		return Object.assign( new this.constructor(), this );

	}

}

export default Binding;
