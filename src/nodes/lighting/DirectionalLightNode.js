import AnalyticLightNode from './AnalyticLightNode.js';
import { lightTargetDirection } from '../accessors/Lights.js';

class DirectionalLightNode extends AnalyticLightNode {

	static get type() {

		return 'DirectionalLightNode';

	}

	constructor( light = null ) {

		super( light );

	}

	setup( builder ) {

		super.setup( builder );

		const light = this.light;

		let lightingModel = builder.context.lightingModel;

		if ( light.lightingModel ) {

			lightingModel = light.lightingModel.stack( this, lightingModel );

		}

		const lightColor = this.colorNode;
		const lightDirection = lightTargetDirection( light );
		const reflectedLight = builder.context.reflectedLight;

		lightingModel.direct( {
			lightDirection,
			lightColor,
			reflectedLight
		}, builder.stack, builder );

	}

}

export default DirectionalLightNode;
