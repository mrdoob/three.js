/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.PointLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3();
	this.intensity = intensity || 1;
	this.distance = distance || 0;

};

THREE.PointLight.prototype = new THREE.Light();
THREE.PointLight.prototype.constructor = THREE.PointLight; 
