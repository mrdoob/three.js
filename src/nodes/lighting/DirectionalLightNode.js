import { registerNode } from '../core/Node.js';
import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from './LightNode.js';

class DirectionalLightNode extends AnalyticLightNode {

	constructor( light = null ) {

		super( light );

	}

	setup( builder ) {

		super.setup( builder );

		const lightingModel = builder.context.lightingModel;

		const lightColor = this.colorNode;
		const lightDirection = lightTargetDirection( this.light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default DirectionalLightNode;

DirectionalLightNode.type = /*@__PURE__*/ registerNode( 'DirectionalLight', DirectionalLightNode );
