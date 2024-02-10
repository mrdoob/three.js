import { LightShadow } from './LightShadow.js';
import * as MathUtils from '../math/MathUtils.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

class SpotLightShadow extends LightShadow {

	constructor() {

		super( new PerspectiveCamera( 50, 1, 0.5, 500 ) );

		this.isSpotLightShadow = true;

		this.focus = 1;

	}

	updateMatrices( light ) {

		const camera = this.camera;

		const fov = MathUtils.RAD2DEG * 2 * light.angle * this.focus;
		const aspect = this.mapSize.width / this.mapSize.height;

		if ( fov !== camera.fov || aspect !== camera.aspect ) {

			camera.fov = fov;
			camera.aspect = aspect;
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
