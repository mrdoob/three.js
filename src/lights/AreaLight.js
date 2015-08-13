/**
 * @author MPanknin / http://www.redplant.de/
 * @author alteredq / http://alteredqualia.com/
 * @author prafullit
 */

THREE.AreaLight = function ( color, intensity ) {

	THREE.Light.call( this, color );

	this.type = 'AreaLight';

	this.normal = new THREE.Vector3( 0, - 1, 0 );
	this.right = new THREE.Vector3( 1, 0, 0 );

	this.intensity = ( intensity !== undefined ) ? intensity : 1;

	this.width = 1.0;
	this.height = 1.0;

	this.constantAttenuation = 1.5;
	this.linearAttenuation = 0.5;
	this.quadraticAttenuation = 0.1;

};

THREE.AreaLight.prototype = Object.create( THREE.Light.prototype );
THREE.AreaLight.prototype.constructor = THREE.AreaLight;

THREE.AreaLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.intensity = source.intensity;
	this.normal.copy( source.normal );
	this.right.copy( source.right );
	this.width = source.width;
	this.height = source.height;
	this.constantAttenuation = source.constantAttenuation;
	this.linearAttenuation = source.linearAttenuation;
	this.quadraticAttenuation = source.quadraticAttenuation;

	return this;

};

THREE.AreaLight.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.intensity = this.intensity;

	return data;

};
