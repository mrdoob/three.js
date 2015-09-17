/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.HemisphereLight = function ( skyColor, groundColor, intensity ) {

	THREE.Light.call( this, skyColor );

	this.type = 'HemisphereLight';

	this.position.set( 0, 1, 0 );
	this.updateMatrix();

	this.groundColor = new THREE.Color( groundColor );
	this.intensity = ( intensity !== undefined ) ? intensity : 1;

};

THREE.HemisphereLight.prototype = Object.create( THREE.Light.prototype );
THREE.HemisphereLight.prototype.constructor = THREE.HemisphereLight;

THREE.HemisphereLight.prototype.copy = function ( source ) {

	THREE.Light.prototype.copy.call( this, source );

	this.groundColor.copy( source.groundColor );
	this.intensity = source.intensity;

	return this;

};

THREE.HemisphereLight.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.color = this.color.getHex();
	data.object.groundColor = this.groundColor.getHex();
	data.object.intensity = this.intensity;

	return data;

};
