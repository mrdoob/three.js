/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They represent user-defined, native shader code portions that are going to be
 * injected by the builder. A dictionary of node codes is maintained in {@link NodeBuilder#codes}
 * for this purpose.
 */
class NodeCode {

	/**
	 * Constructs a new code node.
	 *
	 * @param {string} name - The name of the code.
	 * @param {string} type - The node type.
	 * @param {string} [code=''] - The native shader code.
	 */
	constructor( name, type, code = '' ) {

		/**
		 * The name of the code.
		 *
		 * @type {string}
		 */
		this.name = name;

		/**
		 * The node type.
		 *
		 * @type {string}
		 */
		this.type = type;

		/**
		 * The native shader code.
		 *
		 * @type {string}
		 * @default ''
		 */
		this.code = code;

		Object.defineProperty( this, 'isNodeCode', { value: true } );

	}

}

export default NodeCode;
