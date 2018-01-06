import { LightShadow } from './LightShadow.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';

function ProjectorLightShadow() {

	LightShadow.call( this, new PerspectiveCamera( 50, 1, 0.5, 500 ) );

}

ProjectorLightShadow.prototype = Object.assign( Object.create( LightShadow.prototype ), {

	constructor: ProjectorLightShadow,

	isProjectorLightShadow: true,

	update: function ( light ) {

		var camera = this.camera;
		var cameraNeedsUpdate =
			light.fov !== camera.fov
			|| light.aspect !== camera.aspect
			|| ( light.distance || camera.far ) !== camera.far;

		if ( cameraNeedsUpdate ) {

			camera.fov = light.fov;
			camera.aspect = light.aspect;
			camera.far = light.distance || camera.far;
			camera.updateProjectionMatrix();

		}

	}

} );


export { ProjectorLightShadow };
