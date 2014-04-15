/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.OrthographicCamera = function ( left, right, top, bottom, near, far ) {

	THREE.Camera.call( this );

	this.left = left;
	this.right = right;
	this.top = top;
	this.bottom = bottom;

	this.near = ( near !== undefined ) ? near : 0.1;
	this.far = ( far !== undefined ) ? far : 2000;

	this.updateProjectionMatrix();

};

THREE.OrthographicCamera.prototype = Object.create( THREE.Camera.prototype );

THREE.OrthographicCamera.prototype.updateProjectionMatrix = function () {

	this.projectionMatrix.makeOrthographic( this.left, this.right, this.top, this.bottom, this.near, this.far );

};

THREE.OrthographicCamera.prototype.clone = function () {

	var camera = new THREE.OrthographicCamera();

	THREE.Camera.prototype.clone.call( this, camera );

	camera.left = this.left;
	camera.right = this.right;
	camera.top = this.top;
	camera.bottom = this.bottom;
	
	camera.near = this.near;
	camera.far = this.far;

	return camera;
};

THREE.OrthographicCamera.prototype.toJSON = function( exporters ) {

  var data = THREE.Object3D.prototype.toJSON.call( this, exporters );
	
	data.type = 'OrthographicCamera';
	data.left = this.left;
	data.right = this.right;
	data.top = this.top;
	data.bottom = this.bottom;
	data.near = this.near;
	data.far = this.far;

	return data;

};

THREE.OrthographicCamera.fromJSON = function( data, geometries, materials ) {
  
  var object = new THREE.OrthographicCamera( data.left, data.right, data.top, data.bottom, data.near, data.far );
  THREE.Object3D.fromJSONCommon.call( object, data, geometries, materials );
  return object;

};