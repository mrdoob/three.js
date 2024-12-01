/**
 * Base class for node functions. A derived module must be implemented
 * for each supported native shader language. Similar to other `Node*` modules,
 * this class is only relevant during the building process and not used
 * in user-level code.
 */
class NodeFunction {

	/**
	 * Constructs a new node function.
	 *
	 * @param {String} type - The node type. This type is the return type of the node function.
	 * @param {Array<NodeFunctionInput>} inputs - The function's inputs.
	 * @param {String} [name=''] - The function's name.
	 * @param {String} [precision=''] - The precision qualifier.
	 */
	constructor( type, inputs, name = '', precision = '' ) {

		/**
		 * The node type. This type is the return type of the node function.
		 *
		 * @type {String}
		 */
		this.type = type;

		/**
		 * The function's inputs.
		 *
		 * @type {Array<NodeFunctionInput>}
		 */
		this.inputs = inputs;

		/**
		 * The name of the uniform.
		 *
		 * @type {String}
		 * @default ''
		 */
		this.name = name;

		/**
		 * The precision qualifier.
		 *
		 * @type {String}
		 * @default ''
		 */
		this.precision = precision;

	}

	/**
	 * This method returns the native code of the node function.
	 *
	 * @abstract
	 * @param {String} name - The function's name.
	 * @return {String} A shader code.
	 */
	getCode( /*name = this.name*/ ) {

		console.warn( 'Abstract function.' );

	}

}

NodeFunction.isNodeFunction = true;

export default NodeFunction;
