import { LightShadow } from './LightShadow.js';
import { _Math } from '../math/Math.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function SpotLightShadow() {

	LightShadow.call( this, new PerspectiveCamera( 50, 1, 0.5, 500 ) );

}

SpotLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: SpotLightShadow,

	isSpotLightShadow: true,

	updateMatrices: function ( light, viewCamera, viewportIndex ) {

		var camera = this.camera,
			lookTarget = this._lookTarget,
			lightPositionWorld = this._lightPositionWorld;

		var fov = _Math.RAD2DEG * 2 * light.angle;
		var aspect = this.mapSize.width / this.mapSize.height;
		var far = light.distance || camera.far;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

		lightPositionWorld.setFromMatrixPosition( light.matrixWorld );
		camera.position.copy( lightPositionWorld );

		lookTarget.setFromMatrixPosition( light.target.matrixWorld );
		camera.lookAt( lookTarget );
		camera.updateMatrixWorld();

		LightShadow.prototype.updateMatrices.call( this, light, viewCamera, viewportIndex );

	}

} );


export { SpotLightShadow };
