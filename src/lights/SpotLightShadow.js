import { LightShadow } from './LightShadow.js';
import * as MathUtils from '../math/MathUtils.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

/** Define default shadow distance. */
const DEF_DISTANCE = 500;

class SpotLightShadow extends LightShadow {

	constructor() {

		super( new PerspectiveCamera( 50, 1, 0.5, DEF_DISTANCE ) );

		this.focus = 1;

	}

	updateMatrices( light ) {

		const camera = this.camera;

		const fov = MathUtils.RAD2DEG * 2 * light.angle * this.focus;
		const aspect = this.mapSize.width / this.mapSize.height;
		const far = light.distance === 0 ? DEF_DISTANCE : light.distance || camera.far;

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

SpotLightShadow.prototype.isSpotLightShadow = true;

export { SpotLightShadow };
