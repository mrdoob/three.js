/**
 * @author mr.doob / http://mrdoob.com/
 */

THREE.DirectionalLight = function ( hex, intensity, distance, castShadow ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.intensity = intensity || 1;
	this.distance = distance || 0;
	this.castShadow = castShadow !== undefined ? castShadow : false;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight; 
