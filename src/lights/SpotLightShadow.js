import { LightShadow } from './LightShadow';
import { _Math } from '../math/Math';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function SpotLightShadow () {
	this.isSpotLightShadow = true;

	LightShadow.call( this, new PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

SpotLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: SpotLightShadow,

	update: function ( light ) {

		var fov = _Math.RAD2DEG * 2 * light.angle;
		var aspect = this.mapSize.width / this.mapSize.height;
		var far = light.distance || 500;

		var camera = this.camera;

		if ( fov !== camera.fov || aspect !== camera.aspect || far !== camera.far ) {

			camera.fov = fov;
			camera.aspect = aspect;
			camera.far = far;
			camera.updateProjectionMatrix();

		}

	}

} );


export { SpotLightShadow };