/**
 * @author mrdoob / http://mrdoob.com/
*/

THREE.StereoCamera = function StereoCamera( cameraLeft, cameraRight ) {

	THREE.Camera.call( this, fov, aspect, near, far );

	this.add( cameraLeft, cameraRight );

};

THREE.StereoCamera.prototype = Object.create( THREE.Camera.prototype );
THREE.StereoCamera.prototype.constructor = THREE.StereoCamera;
