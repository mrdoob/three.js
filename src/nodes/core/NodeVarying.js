import NodeVar from './NodeVar.js';

/**
 * {@link NodeBuilder} is going to create instances of this class during the build process
 * of nodes. They represent the final shader varyings that are going to be generated
 * by the builder. An array of node varyings is maintained in {@link NodeBuilder#varyings} for
 * this purpose.
 *
 * @augments NodeVar
 */
class NodeVarying extends NodeVar {

	/**
	 * Constructs a new node varying.
	 *
	 * @param {string} name - The name of the varying.
	 * @param {string} type - The type of the varying.
	 * @param {?string} interpolationType - The interpolation type of the varying.
	 * @param {?string} interpolationSampling - The interpolation sampling type of the varying.
	 */
	constructor( name, type, interpolationType = null, interpolationSampling = null ) {

		super( name, type );

		/**
		 * Whether this varying requires interpolation or not. This property can be used
		 * to check if the varying can be optimized for a variable.
		 *
		 * @type {boolean}
		 * @default false
		 */
		this.needsInterpolation = false;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isNodeVarying = true;

		/**
		 * The interpolation type of the varying data.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.interpolationType = interpolationType;

		/**
		 * The interpolation sampling type of varying data.
		 *
		 * @type {?string}
		 * @default null
		 */
		this.interpolationSampling = interpolationSampling;

	}

}

export default NodeVarying;
