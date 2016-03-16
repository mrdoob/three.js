/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpotLight = function ( color, intensity, distance, angle, penumbra, decay ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'SpotLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.distance = ( distance !== undefined ) ? distance : 0;
	this.angle = ( angle !== undefined ) ? angle : Math.PI / 3;
	this.penumbra = ( penumbra !== undefined ) ? penumbra : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 0.5, 500 ) );

};

THREE.SpotLight.prototype = Object.create( THREE.Light.prototype );
THREE.SpotLight.prototype.constructor = THREE.SpotLight;

Object.defineProperty( THREE.SpotLight.prototype, "power", {

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

THREE.SpotLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.distance = source.distance;
	this.angle = source.angle;
	this.penumbra = source.penumbra;
	this.decay = source.decay;

	this.target = source.target.clone();

	this.shadow = source.shadow.clone();

	return this;

};
