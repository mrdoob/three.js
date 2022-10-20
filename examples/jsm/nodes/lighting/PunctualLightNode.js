import AnalyticLightNode from './AnalyticLightNode.js';
import LightsNode from './LightsNode.js';
import Object3DNode from '../accessors/Object3DNode.js';
import getDistanceAttenuation from '../functions/light/getDistanceAttenuation.js';
import { uniform, mul, normalize, length, sub, positionView } from '../shadernode/ShaderNodeElements.js';

import { PointLight } from 'three';

class PunctualLightNode extends AnalyticLightNode {

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

		const { colorNode, cutoffDistanceNode, decayExponentNode } = this;

		const lightPositionViewNode = new Object3DNode( Object3DNode.VIEW_POSITION, this.light );
		const lVector = sub( lightPositionViewNode, positionView );

		const lightDirection = normalize( lVector );
		const lightDistance = length( lVector );

		const lightAttenuation = getDistanceAttenuation.call( {
			lightDistance,
			cutoffDistance: cutoffDistanceNode,
			decayExponent: decayExponentNode
		} );

		const lightColor = mul( colorNode, lightAttenuation );

		const lightingModelFunctionNode = builder.context.lightingModelNode;
		const reflectedLight = builder.context.reflectedLight;

		if ( lightingModelFunctionNode?.direct ) {

			lightingModelFunctionNode.direct.call( {
				lightDirection,
				lightColor,
				reflectedLight
			}, builder );

		}

	}

}

LightsNode.setReference( PointLight, PunctualLightNode );

export default PunctualLightNode;
