import { LightShadow } from './LightShadow.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

/**
 * Represents the shadow configuration of point lights.
 *
 * @augments LightShadow
 */
class PointLightShadow extends LightShadow {

	/**
	 * Constructs a new point light shadow.
	 */
	constructor() {

		super( new PerspectiveCamera( 90, 1, 0.5, 500 ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isPointLightShadow = true;

	}

}

export { PointLightShadow };
