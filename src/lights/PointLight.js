import { Light } from './Light';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
import { LightShadow } from './LightShadow';

/**
 * @author mrdoob / http://mrdoob.com/
 */


function PointLight ( color, intensity, distance, decay ) {
	this.isPointLight = true;

	Light.call( this, color, intensity );

	this.type = 'PointLight';

	Object.defineProperty( this, 'power', {
		get: function () {
			// intensity = power per solid angle.
			// ref: equation (15) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
			return this.intensity * 4 * Math.PI;

		},
		set: function ( power ) {
			// intensity = power per solid angle.
			// ref: equation (15) from http://www.frostbite.com/wp-content/uploads/2014/11/course_notes_moving_frostbite_to_pbr.pdf
			this.intensity = power / ( 4 * Math.PI );
		}
	} );

	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new LightShadow( new PerspectiveCamera( 90, 1, 0.5, 500 ) );

};

PointLight.prototype = Object.assign( Object.create( Light.prototype ), {

	constructor: PointLight,

	copy: function ( source ) {

		Light.prototype.copy.call( this, source );

		this.distance = source.distance;
		this.decay = source.decay;

		this.shadow = source.shadow.clone();

		return this;

	}

} );


export { PointLight };