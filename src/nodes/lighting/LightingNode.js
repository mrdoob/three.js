import Node from '../core/Node.js';

/**
 * Base class for lighting nodes.
 *
 * @augments Node
 */
class LightingNode extends Node {

	static get type() {

		return 'LightingNode';

	}

	/**
	 * Constructs a new lighting node.
	 */
	constructor() {

		super( 'vec3' );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {Boolean}
		 * @readonly
		 * @default true
		 */
		this.isLightingNode = true;

	}

}

export default LightingNode;
