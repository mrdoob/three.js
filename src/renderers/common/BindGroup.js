let _id = 0;

/**
 * A bind group represents a collection of bindings and thus a collection
 * or resources. Bind groups are assigned to pipelines to provide them
 * with the required resources (like uniform buffers or textures).
 *
 * @private
 */
class BindGroup {

	/**
	 * Constructs a new bind group.
	 *
	 * @param {string} name - The bind group's name.
	 * @param {Array<Binding>} bindings - An array of bindings.
	 * @param {number} index - The group index.
	 */
	constructor( name = '', bindings = [] ) {

		/**
		 * The bind group's name.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * An array of bindings.
		 *
		 * @type {Array<Binding>}
		 */
		this.bindings = bindings;

		/**
		 * The group's ID.
		 *
		 * @type {number}
		 */
		this.id = _id ++;

	}

}

export default BindGroup;
