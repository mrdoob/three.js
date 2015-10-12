/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpotLight = function ( color, intensity, distance, angle, exponent, decay ) {

	THREE.Light.call( this, color );

	this.type = 'SpotLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.angle = ( angle !== undefined ) ? angle : Math.PI / 3;
	this.exponent = ( exponent !== undefined ) ? exponent : 10;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 50, 5000 ) );

};

THREE.SpotLight.prototype = Object.create( THREE.Light.prototype );
THREE.SpotLight.prototype.constructor = THREE.SpotLight;

THREE.SpotLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.distance = source.distance;
	this.angle = source.angle;
	this.exponent = source.exponent;
	this.decay = source.decay;

	this.target = source.target.clone();

	this.shadow = source.shadow.clone();

	return this;

};
