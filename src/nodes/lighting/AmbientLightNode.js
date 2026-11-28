import AnalyticLightNode from './AnalyticLightNode.js';

/**
 * Module for representing ambient lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class AmbientLightNode extends AnalyticLightNode {

	static get type() {

		return 'AmbientLightNode';

	}

	/**
	 * Constructs a new ambient light node.
	 *
	 * @param {?AmbientLight} [light=null] - The ambient light source.
	 */
	constructor( light = null ) {

		super( light );

	}

	setup( builder ) {

		const { colorNode } = this;

		builder.context.irradiance.addAssign( colorNode );

		// A uniform environment reflects its irradiance / PI at any roughness
		const radiance = colorNode.div( Math.PI );

		builder.context.lightingModel.indirectRadiance( () => radiance, builder );

	}

}

export default AmbientLightNode;
