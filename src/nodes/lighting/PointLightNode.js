import AnalyticLightNode from './AnalyticLightNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { lightViewPosition } from '../accessors/Lights.js';
import { positionView } from '../accessors/Position.js';
import { Fn } from '../tsl/TSLBase.js';
import { renderGroup } from '../core/UniformGroupNode.js';
import { pointShadow } from './PointShadowNode.js';

export const directPointLight = Fn( ( { color, lightViewPosition, cutoffDistance, decayExponent }, builder ) => {

	const lightingModel = builder.context.lightingModel;

	const lVector = lightViewPosition.sub( positionView ); // @TODO: Add it into LightNode

	const lightDirection = lVector.normalize();
	const lightDistance = lVector.length();

	const lightAttenuation = getDistanceAttenuation( {
		lightDistance,
		cutoffDistance,
		decayExponent
	} );

	const lightColor = color.mul( lightAttenuation );

	const reflectedLight = builder.context.reflectedLight;

	lightingModel.direct( {
		lightDirection,
		lightColor,
		reflectedLight
	}, builder.stack, builder );

} );

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

	setupShadowNode() {

		return pointShadow( this.light );

	}

	setup( builder ) {

		super.setup( builder );

		directPointLight( {
			color: this.colorNode,
			lightViewPosition: lightViewPosition( this.light ),
			cutoffDistance: this.cutoffDistanceNode,
			decayExponent: this.decayExponentNode
		} ).append();

	}

}

export default PointLightNode;
