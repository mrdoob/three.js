import LightingModel from '../core/LightingModel.js';
import { diffuseColor } from '../core/PropertyNode.js';

class BasicLightingModel extends LightingModel {

	constructor() {

		super();

	}

	finish( context ) {

		context.outgoingLight.rgb.assign( diffuseColor.rgb ); // TODO: Optimize LightsNode to avoid this assignment

	}

}

export default BasicLightingModel;
