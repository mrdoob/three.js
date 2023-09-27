import AnalyticLightNode from './AnalyticLightNode.js';
import { addLightNode } from './LightsNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { objectViewPosition } from '../accessors/Object3DNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNodeClass } from '../core/Node.js';

import { PointLight } from 'three';

class PointLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.cutoffDistanceNode = uniform( 0 );
		this.decayExponentNode = uniform( 0 );

	}

	update( frame ) {

		const { light } = this;

		super.update( frame );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	construct( builder ) {

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lightingModel = builder.context.lightingModel;

		const lVector = objectViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

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
		} );

	}

}

export default PointLightNode;

addLightNode( PointLight, PointLightNode );

addNodeClass( PointLightNode );
