import LightingNode from './LightingNode.js';

/**
 * A lighting node that modifies the specular radiance of the environment before the lighting model
 * applies the specular BRDF, e.g. to replace it with screen-space reflections where they have coverage.
 * Used in {@link NodeMaterial} with the `getRadiance()` function of the context.
 *
 * @augments LightingNode
 */
class RadianceNode extends LightingNode {

	static get type() {

		return 'RadianceNode';

	}

	/**
	 * Constructs a new radiance node.
	 *
	 * @param {function(Node<vec3>, NodeBuilder): Node<vec3>} callback - Returns the radiance from the radiance of the environment.
	 */
	constructor( callback ) {

		super();

		/**
		 * Returns the radiance from the radiance of the environment.
		 *
		 * @type {function(Node<vec3>, NodeBuilder): Node<vec3>}
		 */
		this.callback = callback;

	}

	setup( builder ) {

		const { radiance } = builder.context;

		radiance.assign( this.callback( radiance, builder ) );

	}

}

export default RadianceNode;
