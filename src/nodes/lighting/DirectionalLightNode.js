import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from '../accessors/Lights.js';

/**
 * Module for representing directional lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class DirectionalLightNode extends AnalyticLightNode {

	static get type() {

		return 'DirectionalLightNode';

	}

	/**
	 * Constructs a new directional light node.
	 *
	 * @param {?DirectionalLight} [light=null] - The directional light source.
	 */
	constructor( light = null ) {

		super( light );

	}

	setupDirect() {

		const lightColor = this.colorNode;
		const lightDirection = lightTargetDirection( this.light );

		return { lightDirection, lightColor };

	}

}

export default DirectionalLightNode;
