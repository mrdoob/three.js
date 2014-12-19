/**
 * @author bhouston / http://clara.io/
 * @author MPanknin / http://www.redplant.de/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.AreaLight = function ( color, intensity, distance, decayExponent ) {

	THREE.Light.call( this, color );

	this.position.set( 0, 1, 0 );
	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decayExponent = ( decayExponent !== undefined ) ? decayExponent : 0;	// for physically correct lights, should be 2.

	this.width = 1.0;
	this.height = 1.0;

	// TODO: implement shadow maps.  -bhouston, Oct 15, 2014
};

THREE.AreaLight.prototype = Object.create( THREE.Light.prototype );

THREE.AreaLight.prototype.clone = function () {

	var light = new THREE.AreaLight();

	THREE.Light.prototype.clone.call( this, light );

	light.target = this.target.clone();
	
	light.intensity = this.intensity;
	light.distance = this.distance;
	light.decayExponent = this.decayExponent;

	light.width = this.width;
	light.height = this.height;

	return light;

};
