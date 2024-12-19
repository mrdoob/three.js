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
	 * @param {AmbientLight?} [light=null] - The ambient light source.
	 */
	constructor( light = null ) {

		super( light );

	}

	setup( { context } ) {

		context.irradiance.addAssign( this.colorNode );

	}

}

export default AmbientLightNode;
