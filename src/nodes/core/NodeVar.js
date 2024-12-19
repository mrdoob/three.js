/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They represent the final shader variables that are going to be generated
 * by the builder. A dictionary of node variables is maintained in {@link NodeBuilder#vars} for
 * this purpose.
 */
class NodeVar {

	/**
	 * Constructs a new node variable.
	 *
	 * @param {String} name - The name of the variable.
	 * @param {String} type - The type of the variable.
	 */
	constructor( name, type ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeVar = true;

		/**
		 * The name of the variable.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * The type of the variable.
		 *
		 * @type {String}
		 */
		this.type = type;

	}

}

export default NodeVar;
