import Node from '../core/Node.js';
import { uv } from '../accessors/UV.js';
import { nodeObject } from '../tsl/TSLCore.js';

/**
 * Class representing a node that samples a value using a provided callback function.
 *
 * @extends Node
 */
class SampleNode extends Node {

	/**
	 * Returns the type of the node.
	 *
	 * @type {string}
	 * @readonly
	 * @static
	 */
	static get type() {

		return 'SampleNode';

	}

	/**
	 * Creates an instance of SampleNode.
	 *
	 * @param {Function} callback - The function to be called when sampling. Should accept a UV node and return a value.
	 * @param {?Node<vec2>} [uvNode=null] - The UV node to be used in the texture sampling.
	 */
	constructor( callback, uvNode = null ) {

		super();

		this.callback = callback;

		/**
		 * Represents the texture coordinates.
		 *
		 * @type {?Node<vec2|vec3>}
		 * @default null
		 */
		this.uvNode = uvNode;

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSampleNode = true;

	}

	/**
	 * Sets up the node by sampling with the default UV accessor.
	 *
	 * @returns {Node} The result of the callback function when called with the UV node.
	 */
	setup() {

		return this.sample( uv() );

	}

	/**
	 * Calls the callback function with the provided UV node.
	 *
	 * @param {Node<vec2>} uv - The UV node or value to be passed to the callback.
	 * @returns {Node} The result of the callback function.
	 */
	sample( uv ) {

		return this.callback( uv );

	}

}

export default SampleNode;

/**
 * Helper function to create a SampleNode wrapped as a node object.
 *
 * @function
 * @param {Function} callback - The function to be called when sampling. Should accept a UV node and return a value.
 * @param {?Node<vec2>} [uv=null] - The UV node to be used in the texture sampling.
 * @returns {SampleNode} The created SampleNode instance wrapped as a node object.
 */
export const sample = ( callback, uv = null ) => nodeObject( new SampleNode( callback, nodeObject( uv ) ) );
