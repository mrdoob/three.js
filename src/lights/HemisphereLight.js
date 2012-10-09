/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.HemisphereLight = function ( skyColorHex, groundColorHex, intensity ) {

	THREE.Light.call( this, skyColorHex );

	this.groundColor = new THREE.Color( groundColorHex );

	this.position = new THREE.Vector3( 0, 100, 0 );

	this.intensity = ( intensity !== undefined ) ? intensity : 1;

};

THREE.HemisphereLight.prototype = Object.create( THREE.Light.prototype );
