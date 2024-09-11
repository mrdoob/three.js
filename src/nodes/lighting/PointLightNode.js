import AnalyticLightNode from './AnalyticLightNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { lightViewPosition } from '../accessors/Lights.js';
import { positionView } from '../accessors/Position.js';
import { renderGroup } from '../TSL.js';

class PointLightNode extends AnalyticLightNode {

	static get type() {

		return 'PointLightNode';

	}

	constructor( light = null ) {

		super( light );

		this.cutoffDistanceNode = uniform( 0 ).setGroup( renderGroup );
		this.decayExponentNode = uniform( 0 ).setGroup( renderGroup );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	setup( builder ) {

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lightingModel = builder.context.lightingModel;

		const lVector = lightViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

		const lightDirection = lVector.normalize();
		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const lightColor = colorNode.mul( lightAttenuation );

		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default PointLightNode;
