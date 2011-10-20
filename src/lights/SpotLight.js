/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.SpotLight = function ( hex, intensity, distance, castShadow ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

	this.castShadow = ( castShadow !== undefined ) ? castShadow : false;

};

THREE.SpotLight.prototype = new THREE.Light();
THREE.SpotLight.prototype.constructor = THREE.SpotLight;
