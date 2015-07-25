/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.OrthographicCamera = function ( left, right, top, bottom, near, far ) {

	THREE.Camera.call( this );

	this.type = 'OrthographicCamera';

	this.zoom = 1;

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;

	this.near = ( near !== undefined ) ? near : 0.1;
	this.far = ( far !== undefined ) ? far : 2000;

	this.updateProjectionMatrix();

};

THREE.OrthographicCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.OrthographicCamera.prototype.constructor = THREE.OrthographicCamera;

THREE.OrthographicCamera.prototype.updateProjectionMatrix = function () {

	var dx = ( this.right - this.left ) / ( 2 * this.zoom );
	var dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
	var cx = ( this.right + this.left ) / 2;
	var cy = ( this.top + this.bottom ) / 2;

	this.projectionMatrix.makeOrthographic( cx - dx, cx + dx, cy + dy, cy - dy, this.near, this.far );

};

THREE.OrthographicCamera.prototype.clone = function () {

	var camera = new THREE.OrthographicCamera();

	camera.copy( this );

	camera.zoom = this.zoom;

	camera.left = this.left;
	camera.right = this.right;
	camera.top = this.top;
	camera.bottom = this.bottom;

	camera.near = this.near;
	camera.far = this.far;

	return camera;

};

THREE.OrthographicCamera.prototype.toJSON = function ( meta ) {

	var data = THREE.Object3D.prototype.toJSON.call( this, meta );

	data.object.zoom = this.zoom;
	data.object.left = this.left;
	data.object.right = this.right;
	data.object.top = this.top;
	data.object.bottom = this.bottom;
	data.object.near = this.near;
	data.object.far = this.far;

	return data;

};
