import { Light } from './Light.js';
import { ProjectorLightShadow } from './ProjectorLightShadow.js';
import { Object3D } from '../core/Object3D.js';

/**
 * @author usefulthink / https://github.com/usefulthink
 */

function ProjectorLight( color, intensity, distance, fov, aspect, decay ) {

	Light.call( this, color, intensity );

	this.type = 'ProjectorLight';

	this.position.copy( Object3D.DefaultUp );
	this.updateMatrix();

	this.target = new Object3D();

	Object.defineProperty( this, 'power', {
		get: function () {

			// intensity = power per solid angle.
			// ref: equation (17) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
			return this.intensity * Math.PI;

		},
		set: function ( power ) {

			// intensity = power per solid angle.
			// ref: equation (17) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
			this.intensity = power / Math.PI;

		}
	} );

	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1; // should be 2 for physically correct lights.

	this.fov = fov; // vertical field-of-view in degrees
	this.aspect = ( aspect !== undefined ) ? aspect : 1;

	this.shadow = new ProjectorLightShadow();

	this.map = null;

}

ProjectorLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: ProjectorLight,

	isProjectorLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.position = source.position.clone();
		this.target = source.target.clone();

		this.distance = source.distance;
		this.decay = source.decay;
		this.fov = source.angle;
		this.aspect = source.aspect;

		this.shadow = source.shadow.clone();

		if ( source.map !== null ) {

			this.map = source.map.clone();

		}

		return this;

	}

} );


export { ProjectorLight };
