import AnalyticLightNode from './AnalyticLightNode.js';
import LightsNode from './LightsNode.js';
import getDistanceAttenuation from '../functions/light/getDistanceAttenuation.js';
import getDirectionVector from '../functions/light/getDirectionVector.js';
import { uniform, smoothstep, positionView, objectViewPosition } from '../shadernode/ShaderNodeElements.js';

import { Vector3, SpotLight } from 'three';

class SpotLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.directionNode = uniform( new Vector3() );

		this.coneCosNode = uniform( 0 );
		this.penumbraCosNode = uniform( 0 );

		this.cutoffDistanceNode = uniform( 0 );
		this.decayExponentNode = uniform( 0 );

	}

	update( frame ) {

		super.update( frame );

		const { light } = this;

		getDirectionVector( light, frame.camera, this.directionNode.value );

		this.coneCosNode.value = Math.cos( light.angle );
		this.penumbraCosNode.value = Math.cos( light.angle * ( 1 - light.penumbra ) );

		this.cutoffDistanceNode.value = light.distance;
		this.decayExponentNode.value = light.decay;

	}

	getSpotAttenuation( angleCosine ) {

		const { coneCosNode, penumbraCosNode } = this;

		return smoothstep( coneCosNode, penumbraCosNode, angleCosine );

	}

	construct( builder ) {

		const { colorNode, cutoffDistanceNode, decayExponentNode, light } = this;

		const lVector = objectViewPosition( light ).sub( positionView );

		const lightDirection = lVector.normalize();
		const angleCos = lightDirection.dot( this.directionNode );
		const spotAttenuation = this.getSpotAttenuation( angleCos );

		const lightDistance = lVector.length();

		const lightAttenuation = getDistanceAttenuation.call( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const finalColor = colorNode.mul( spotAttenuation ).mul( lightAttenuation );

		const lightColor = spotAttenuation.greaterThan( 0 ).cond( finalColor, 0 );

		const lightingModelFunctionNode = builder.context.lightingModelNode;
		const reflectedLight = builder.context.reflectedLight;

		if ( lightingModelFunctionNode && lightingModelFunctionNode.direct ) {

			lightingModelFunctionNode.direct.call( {
				lightDirection,
				lightColor,
				reflectedLight
			}, builder );

		}

	}

}

LightsNode.setReference( SpotLight, SpotLightNode );

export default SpotLightNode;
