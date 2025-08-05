import { LightShadow } from './LightShadow.js';
import { RAD2DEG } from '../math/MathUtils.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

/**
 * Represents the shadow configuration of directional lights.
 *
 * @augments LightShadow
 */
class SpotLightShadow extends LightShadow {

	/**
	 * Constructs a new spot light shadow.
	 */
	constructor() {

		super( new PerspectiveCamera( 50, 1, 0.5, 500 ) );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isSpotLightShadow = true;

		/**
		 * Used to focus the shadow camera. The camera's field of view is set as a
		 * percentage of the spotlight's field-of-view. Range is `[0, 1]`.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.focus = 1;

		/**
		 * Texture aspect ratio.
		 *
		 * @type {number}
		 * @default 1
		 */
		this.aspect = 1;

	}

	updateMatrices( light ) {

		const camera = this.camera;

		const fov = RAD2DEG * 2 * light.angle * this.focus;
		const aspect = ( this.mapSize.width / this.mapSize.height ) * this.aspect;
		const far = light.distance || camera.far;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

		super.updateMatrices( light );

	}

	copy( source ) {

		super.copy( source );

		this.focus = source.focus;

		return this;

	}

}

export { SpotLightShadow };
