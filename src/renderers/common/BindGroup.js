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
	 * @param {String} name - The bind group's name.
	 * @param {Array<Binding>} bindings - An array of bindings.
	 * @param {Number} index - The group index.
	 * @param {Array<Binding>} bindingsReference - An array of reference bindings.
	 */
	constructor( name = '', bindings = [], index = 0, bindingsReference = [] ) {

		/**
		 * The bind group's name.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * An array of bindings.
		 *
		 * @type {Array<Binding>}
		 */
		this.bindings = bindings;

		/**
		 * The group index.
		 *
		 * @type {Number}
		 */
		this.index = index;

		/**
		 * An array of reference bindings.
		 *
		 * @type {Array<Binding>}
		 */
		this.bindingsReference = bindingsReference;

		/**
		 * The group's ID.
		 *
		 * @type {Number}
		 */
		this.id = _id ++;

	}

}

export default BindGroup;
