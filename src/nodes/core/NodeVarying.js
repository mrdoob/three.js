import NodeVar from './NodeVar.js';

/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They are representing the final shader varyings that are going to be generated
 * by the builder. An Array of node varyings is maintained in {@link NodeBuilder#varyings} for
 * this purpose.
 *
 * @augments NodeVar
 */
class NodeVarying extends NodeVar {

	/**
	 * Constructs a new node varying.
	 *
	 * @param {String} name - The name of the variable.
	 * @param {String} type - The type of the variable.
	 */
	constructor( name, type ) {

		super( name, type );

		/**
		 * Whether this varying requires interpolation or not.
		 *
		 * @type {String}
		 * @default false
		 */
		this.needsInterpolation = false;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeVarying = true;

	}

}

export default NodeVarying;
