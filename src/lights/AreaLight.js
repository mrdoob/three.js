/**
 * @author abelnation / http://github.com/abelnation
 */

THREE.AreaLight = function ( polygon, color, intensity, distance, decay ) {

	THREE.Light.call( this, color, intensity );

	this.type = 'AreaLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.polygon = ( polygon !== undefined ) ? polygon.clone() : Polygon.makeSquare();
	this.distance = ( distance !== undefined ) ? distance : 0;
	this.decay = ( decay !== undefined ) ? decay : 1; // for physically correct lights, should be 2.

	this.shadow = new THREE.AreaLightShadow( new THREE.PerspectiveCamera( 90, 1, 0.5, 500 ) );

};

THREE.AreaLight.prototype = Object.create( THREE.Light.prototype );
THREE.AreaLight.prototype.constructor = THREE.AreaLight;

THREE.AreaLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.polygon = source.polygon.clone();
	this.distance = source.distance;
	this.decay = source.decay;

	this.shadow = source.shadow.clone();

	return this;

};
