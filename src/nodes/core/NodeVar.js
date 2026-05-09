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
	 * @param {string} name - The name of the variable.
	 * @param {string} type - The type of the variable.
	 * @param {boolean} [readOnly=false] - The read-only flag.
	 * @param {?number} [count=null] - The size.
	 */
	constructor( name, type, readOnly = false, count = null ) {

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeVar = true;

		/**
		 * The name of the variable.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The type of the variable.
		 *
		 * @type {string}
		 */
		this.type = type;

		/**
		 *  The read-only flag.
		 *
		 * @type {boolean}
		 */
		this.readOnly = readOnly;

		/**
		 * The size.
		 *
		 * @type {?number}
		 */
		this.count = count;

	}

}

export default NodeVar;
