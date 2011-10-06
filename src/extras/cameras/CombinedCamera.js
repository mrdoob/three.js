/*
 *	@author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog 
 * 
 *	A handy general perpose camera, for setting FOV, Lens Focal Length,  
 *		and switching between perspective and orthographic views easily.
 *
 */


THREE.CombinedCamera = function ( width, height, fov, near, far, orthonear, orthofar ) {

	THREE.Camera.call( this );

	// We could also handle the projectionMatrix internally, but just wanted to test nested camera objects
	this.cameraO = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 	orthonear, orthofar );
	this.cameraP = new THREE.PerspectiveCamera( fov, width/height, near, far );

	this.toPerspective();

};

THREE.CombinedCamera.prototype = new THREE.Camera();
THREE.CombinedCamera.prototype.constructor = THREE.CoolCamera;

THREE.CombinedCamera.prototype.toPerspective = function () {

	this.near = this.cameraP.near;
	this.far = this.cameraP.far;
	this.projectionMatrix = this.cameraP.projectionMatrix;

};

THREE.CombinedCamera.prototype.toOrthographic = function () {

	this.near = this.cameraO.near;
	this.far = this.cameraO.far;
	this.projectionMatrix = this.cameraO.projectionMatrix;

};

THREE.CombinedCamera.prototype.setFov = function(fov) {

	this.cameraP.fov = fov;
	this.cameraP.updateProjectionMatrix();
	this.toPerspective();

};

/*
* Uses Focal Length (in mm) to estimate and set FOV
* 35mm (fullframe) camera is used if frame size is not specified;
* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
*/
THREE.CombinedCamera.prototype.setLens = function(focalLength, framesize) {

	if (!framesize) framesize = 43.25; // 36x24mm

	var fov = 2 * Math.atan( framesize / (focalLength * 2));
	fov = 180 / Math.PI * fov;
	this.setFov(fov);

	return fov;
};
