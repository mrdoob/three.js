import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
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

	setup( builder ) {

		super.setup( builder );

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lVector = objectViewPosition( light ).sub( positionView.xyz ); // @TODO: Add it into LightNode

		const lightDistance = lVector.length();
		const lightDirection = lVector.div( lightDistance );

		let lightColor = colorNode;

		if ( this.getSpotAttenuation ) {

			const angleCos = lightDirection.dot( lightTargetDirection( light ) );
			const spotAttenuation = this.getSpotAttenuation( angleCos );
			lightColor = lightColor.mul( spotAttenuation );

		}

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );
		lightColor = lightColor.mul( lightAttenuation );

		const reflectedLight = builder.context.reflectedLight;
		builder.context.lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default PointLightNode;

addNodeClass( 'PointLightNode', PointLightNode );

addLightNode( PointLight, PointLightNode );
