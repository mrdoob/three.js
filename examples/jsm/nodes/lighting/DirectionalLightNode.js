import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';
import { addLightNode } from './LightsNode.js';
import { addNodeClass } from '../core/Node.js';

import { DirectionalLight } from 'three';

class DirectionalLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	construct( builder ) {

		super.construct( builder );

		const lightingModel = builder.context.lightingModel;

		const lightColor = this.colorNode;
		const lightDirection = lightTargetDirection( this.light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		} );

	}

}

export default DirectionalLightNode;

addLightNode( DirectionalLight, DirectionalLightNode );

addNodeClass( DirectionalLightNode );
