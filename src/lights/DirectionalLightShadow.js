import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

class DirectionalLightShadow extends LightShadow {

	constructor( ) {

		super( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

	}

}


export { DirectionalLightShadow };
