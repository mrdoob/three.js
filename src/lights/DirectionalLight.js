/**
 * @author mr.doob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 */

THREE.DirectionalLight = function ( hex, intensity, distance ) {

	THREE.Light.call( this, hex );

	this.position = new THREE.Vector3( 0, 1, 0 );
	this.target = new THREE.Object3D();

	this.intensity = ( intensity !== undefined ) ? intensity : 1;
	this.distance = ( distance !== undefined ) ? distance : 0;

	this.castShadow = false;
	this.onlyShadow = false;

	//

	this.shadowCameraNear = 50;
	this.shadowCameraFar = 5000;

	this.shadowCameraLeft = -500;
	this.shadowCameraRight = 500;
	this.shadowCameraTop = 500;
	this.shadowCameraBottom = -500;

	this.shadowCameraVisible = false;

	this.shadowBias = 0;
	this.shadowDarkness = 0.5;

	this.shadowMapWidth = 512;
	this.shadowMapHeight = 512;

	//

	this.shadowCascade = false;

	this.shadowCascadeOffset = new THREE.Vector3( 0, 0, -1000 );
	this.shadowCascadeCount = 2;

	this.shadowCascadeBias = [ 0, 0, 0 ];
	this.shadowCascadeWidth = [ 512, 512, 512 ];
	this.shadowCascadeHeight = [ 512, 512, 512 ];

	this.shadowCascadeNearZ = [ -1.000, 0.990, 0.998 ];
	this.shadowCascadeFarZ  = [  0.990, 0.998, 1.000 ];

	this.shadowCascadeArray = [];

	//

	this.shadowMap = null;
	this.shadowMapSize = null;
	this.shadowCamera = null;
	this.shadowMatrix = null;

};

THREE.DirectionalLight.prototype = new THREE.Light();
THREE.DirectionalLight.prototype.constructor = THREE.DirectionalLight;
