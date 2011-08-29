/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.OrthoCamera = function ( left, right, top, bottom, near, far, target ) {

	THREE.Camera.call( this, 45, 1, near, far, target );

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;

	this.updateProjectionMatrix();

};

THREE.OrthoCamera.prototype = new THREE.Camera();
THREE.OrthoCamera.prototype.constructor = THREE.OrthoCamera;

THREE.OrthoCamera.prototype.updateProjectionMatrix = function () {

	this.projectionMatrix = THREE.Matrix4.makeOrtho( this.left, this.right, this.top, this.bottom, this.near, this.far );

};

