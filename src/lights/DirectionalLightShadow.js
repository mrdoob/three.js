import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

class DirectionalLightShadow extends LightShadow {

	constructor() {

		super( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

	}

	updateMatrices( light ) {

		super.updateMatrices( light );

	}

}

DirectionalLightShadow.prototype.isDirectionalLightShadow = true;

export { DirectionalLightShadow };
