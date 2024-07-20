import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
import { addLightNode } from './LightsNode.js';
import { getDistanceAttenuation } from './LightUtils.js';
import { uniform } from '../core/UniformNode.js';
import { smoothstep } from '../math/MathNode.js';
import { objectViewPosition } from '../accessors/Object3DNode.js';
import { positionView } from '../accessors/PositionNode.js';
import { addNodeClass } from '../core/Node.js';

import { SpotLight } from '../../lights/SpotLight.js';

class SpotLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.coneCosNode = uniform( 0 );
		this.penumbraCosNode = uniform( 0 );

		this.cutoffDistanceNode = uniform( 0 );
		this.decayExponentNode = uniform( 0 );

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	getSpotAttenuation( angleCosine ) {

		const { coneCosNode, penumbraCosNode } = this;

		return smoothstep( coneCosNode, penumbraCosNode, angleCosine );

	}

	setup( builder ) {

		super.setup( builder );

		const lightingModel = builder.context.lightingModel;

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lVector = objectViewPosition( light ).sub( positionView ); // @TODO: Add it into LightNode

		const lightDirection = lVector.normalize();
		const angleCos = lightDirection.dot( lightTargetDirection( light ) );
		const spotAttenuation = this.getSpotAttenuation( angleCos );

		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const lightColor = colorNode.mul( spotAttenuation ).mul( lightAttenuation );

		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default SpotLightNode;

addNodeClass( 'SpotLightNode', SpotLightNode );

addLightNode( SpotLight, SpotLightNode );
