/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.DirectionalLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;
