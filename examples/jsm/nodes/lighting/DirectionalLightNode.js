import AnalyticLightNode from './AnalyticLightNode.js';
import LightsNode from './LightsNode.js';
import getDirectionVector from '../functions/light/getDirectionVector.js';
import { uniform } from '../shadernode/ShaderNodeElements.js';

import { Vector3, DirectionalLight } from 'three';

class DirectionalLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

		this.directionNode = uniform( new Vector3() );

	}

	update( frame ) {

		getDirectionVector( this.light, frame.camera, this.directionNode.value );

		super.update( frame );

	}

	construct( builder ) {

		const lightDirection = this.directionNode.normalize();
		const lightColor = this.colorNode;

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

LightsNode.setReference( DirectionalLight, DirectionalLightNode );

export default DirectionalLightNode;
