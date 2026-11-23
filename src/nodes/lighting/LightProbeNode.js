import AnalyticLightNode from './AnalyticLightNode.js';
import { warnOnce } from '../../utils.js';

/**
 * Module for representing light probes as nodes.
 *
 * @deprecated since r188.
 * @augments AnalyticLightNode
 */
class LightProbeNode extends AnalyticLightNode {

	static get type() {

		return 'LightProbeNode';

	}

	/**
	 * Constructs a new light probe node.
	 *
	 * @deprecated since r188.
	 * @param {?LightProbe} [light=null] - The light probe.
	 */
	constructor( light = null ) {

		super( light );

		warnOnce( 'LightProbeNode: "LightProbeNode" has been removed. Use "LightProbeGrid" or "Scene.environment" instead.' ); // @deprecated r188

	}

}

export default LightProbeNode;
