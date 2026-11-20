import LightingNode from './LightingNode.js';

/**
 * A generic class that can be used by nodes which contribute irradiance
 * that already accounts for ambient occlusion, e.g. global illumination.
 * Unlike {@link IrradianceNode}, the contribution is not modulated by
 * the ambient occlusion of the lighting model. Used in {@link NodeMaterial}.
 *
 * @augments LightingNode
 */
class OcclusionAwareIrradianceNode extends LightingNode {

	static get type() {

		return 'OcclusionAwareIrradianceNode';

	}

	/**
	 * Constructs a new occlusion-aware irradiance node.
	 *
	 * @param {Node<vec3>} node - A node contributing irradiance that accounts for ambient occlusion.
	 */
	constructor( node ) {

		super();

		/**
		 * A node contributing irradiance that accounts for ambient occlusion.
		 *
		 * @type {Node<vec3>}
		 */
		this.node = node;

	}

	setup( builder ) {

		builder.context.occlusionAwareIrradiance.addAssign( this.node );

	}

}

export default OcclusionAwareIrradianceNode;
