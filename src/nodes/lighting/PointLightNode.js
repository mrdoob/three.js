import AnalyticLightNode from './AnalyticLightNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { pointShadow } from './PointShadowNode.js';

export const directPointLight = ( { color, lightVector, cutoffDistance, decayExponent } ) => {

	const lightDirection = lightVector.normalize();
	const lightDistance = lightVector.length();

	const attenuation = getDistanceAttenuation( {
		lightDistance,
		cutoffDistance,
		decayExponent
	} );

	const lightColor = color.mul( attenuation );

	return { lightDirection, lightColor };

};

/**
 * Module for representing point lights as nodes.
 *
 * @augments AnalyticLightNode
 */
class PointLightNode extends AnalyticLightNode {

	static get type() {

		return 'PointLightNode';

	}

	/**
	 * Constructs a new point light node.
	 *
	 * @param {?PointLight} [light=null] - The point light source.
	 */
	constructor( light = null ) {

		super( light );

		/**
		 * Uniform node representing the cutoff distance.
		 *
		 * @type {UniformNode<float>}
		 */
		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );

		/**
		 * Uniform node representing the decay exponent.
		 *
		 * @type {UniformNode<float>}
		 */
		this.decayExponentNode = uniform( 2 ).setGroup( renderGroup );

	}

	/**
	 * Overwritten to updated point light specific uniforms.
	 *
	 * @param {NodeFrame} frame - A reference to the current node frame.
	 */
	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	/**
	 * Overwritten to setup point light specific shadow.
	 *
	 * @return {PointShadowNode}
	 */
	setupShadowNode() {

		return pointShadow( this.light );

	}

	setupDirect( builder ) {

		return directPointLight( {
			color: this.colorNode,
			lightVector: this.getLightVector( builder ),
			cutoffDistance: this.cutoffDistanceNode,
			decayExponent: this.decayExponentNode
		} );

	}

}

export default PointLightNode;
