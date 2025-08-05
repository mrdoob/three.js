import LightingNode from './LightingNode.js';

/**
 * A generic class that can be used by nodes which contribute
 * irradiance to the scene. E.g. a light map node can be used
 * as input for this module. Used in {@link NodeMaterial}.
 *
 * @augments LightingNode
 */
class IrradianceNode extends LightingNode {

	static get type() {

		return 'IrradianceNode';

	}

	/**
	 * Constructs a new irradiance node.
	 *
	 * @param {Node<vec3>} node - A node contributing irradiance.
	 */
	constructor( node ) {

		super();

		/**
		 * A node contributing irradiance.
		 *
		 * @type {Node<vec3>}
		 */
		this.node = node;

	}

	setup( builder ) {

		builder.context.irradiance.addAssign( this.node );

	}

}

export default IrradianceNode;
