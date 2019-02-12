import { Light } from './Light.js';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera.js';
import { LightShadow } from './LightShadow.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */


function PointLight( color, intensity, distance, decay ) {

	Light.call( this, color, intensity );

	this.type = 'PointLight';

	Object.defineProperty( this, 'power', {
		get: function () {

			// intensity = power per solid angle.
			// ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
			return this.intensity * 4 * Math.PI;

		},
		set: function ( power ) {

			// intensity = power per solid angle.
			// ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
			this.intensity = power / ( 4 * Math.PI );

		}
	} );

	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new LightShadow( new PerspectiveCamera( 90, 1, 0.5, 500 ) );

}

PointLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: PointLight,

	isPointLight: true,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.distance = source.distance;
		this.decay = source.decay;

		this.shadow = source.shadow.clone();

		return this;

	}

} );


export { PointLight };
