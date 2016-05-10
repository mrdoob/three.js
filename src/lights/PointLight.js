/**
 * @author mrdoob / http://mrdoob.com/
 */


THREE.PointLight = function ( color, intensity, distance, decay ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'PointLight';

	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 90, 1, 0.5, 500 ) );

};

THREE.PointLight.prototype = Object.create( THREE.Light.prototype );
THREE.PointLight.prototype.constructor = THREE.PointLight;

Object.defineProperty( THREE.PointLight.prototype, "power", {

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

THREE.PointLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.distance = source.distance;
	this.decay = source.decay;

	this.shadow = source.shadow.clone();

	return this;

};
