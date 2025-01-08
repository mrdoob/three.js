import Node from './Node.js';

/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They represent the final shader struct data that are going to be generated
 * by the builder. A dictionary of struct types is maintained in {@link NodeBuilder#structs}
 * for this purpose.
 */
class StructTypeNode extends Node {

	static get type() {

		return 'StructTypeNode';

	}

	/**
	 * Constructs a new struct type node.
	 *
	 * @param {String} name - The name of the struct.
	 * @param {Array<String>} types - An array of types.
	 */
	constructor( name, types ) {

		super();

		/**
		 * The name of the struct.
		 *
		 * @type {String}
		 */
		this.name = name;


		/**
		 * An array of types.
		 *
		 * @type {Array<String>}
		 */
		this.types = types;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isStructTypeNode = true;

	}

	/**
	 * Returns the member types.
	 *
	 * @return {Array<String>} The types.
	 */
	getMemberTypes() {

		return this.types;

	}

}

export default StructTypeNode;
