import { LightShadow } from './LightShadow.js';
import { OrthographicCamera } from '../cameras/OrthographicCamera.js';

/**
 * Represents the shadow configuration of directional lights.
 *
 * @augments LightShadow
 */
class DirectionalLightShadow extends LightShadow {

	/**
	 * Constructs a new directional light shadow.
	 */
	constructor() {

		super( new OrthographicCamera( - 5, 5, 5, - 5, 0.5, 500 ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isDirectionalLightShadow = true;

	}

}

export { DirectionalLightShadow };
