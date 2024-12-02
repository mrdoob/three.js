/**
 * Describes the input of a {@link NodeFunction}.
 */
class NodeFunctionInput {

	/**
	 * Constructs a new node function input.
	 *
	 * @param {String} type - The input type.
	 * @param {String} name - The input name.
	 * @param {Number?} [count=null] - TODO (only relevant for GLSL).
	 * @param {('in'|'out'|'inout')} [qualifier=''] - The parameter qualifier (only relevant for GLSL).
	 * @param {Boolean} [isConst=false] - Whether the input uses a const qualifier or not (only relevant for GLSL).
	 */
	constructor( type, name, count = null, qualifier = '', isConst = false ) {

		/**
		 *  The input type.
		 *
		 * @type {String}
		 */
		this.type = type;

		/**
		 * The input name.
		 *
		 * @type {String}
		 */
		this.name = name;

		/**
		 * TODO (only relevant for GLSL).
		 *
		 * @type {Number?}
		 * @default null
		 */
		this.count = count;

		/**
		 *The parameter qualifier (only relevant for GLSL).
		 *
		 * @type {('in'|'out'|'inout')}
		 * @default ''
		 */
		this.qualifier = qualifier;

		/**
		 * Whether the input uses a const qualifier or not (only relevant for GLSL).
		 *
		 * @type {Boolean}
		 * @default false
		 */
		this.isConst = isConst;

	}

}

NodeFunctionInput.isNodeFunctionInput = true;

export default NodeFunctionInput;
