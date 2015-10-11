/**
 * @author mrdoob / http://mrdoob.com/
 */


THREE.PointLight = function ( color, intensity, distance, decay ) {

	THREE.Light.call( this, color );

	this.type = 'PointLight';

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1;	// for physically correct lights, should be 2.

	this.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 90, 1, 1, 500 ) );

};

THREE.PointLight.prototype = Object.create( THREE.Light.prototype );
THREE.PointLight.prototype.constructor = THREE.PointLight;

THREE.PointLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.distance = source.distance;
	this.decay = source.decay;

	this.shadow = source.shadow.clone();

	return this;

};
