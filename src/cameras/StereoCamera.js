/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.StereoCamera = function ( fov, aspect, near, far ) {

	THREE.PerspectiveCamera.call( this, fov, aspect, near, far );

	this.type = 'StereoCamera';

	this.focalLength = 125;

	this.cameraL = new THREE.PerspectiveCamera();
	this.cameraL.matrixAutoUpdate = false;

	this.cameraR = new THREE.PerspectiveCamera();
	this.cameraR.matrixAutoUpdate = false;

};

THREE.StereoCamera.prototype = Object.create( THREE.PerspectiveCamera.prototype );
THREE.StereoCamera.prototype.constructor = THREE.StereoCamera;

THREE.StereoCamera.prototype.updateMatrixWorld = ( function () {

	var focalLength, fov, aspect, near, far;

	var eyeRight = new THREE.Matrix4();
	var eyeLeft = new THREE.Matrix4();

	return function updateMatrixWorld ( force ) {

		THREE.Object3D.prototype.updateMatrixWorld.call( this, force );

		var needsUpdate = focalLength !== this.focalLength || fov !== this.fov ||
											aspect !== this.aspect || near !== this.near ||
											far !== this.far;

		if ( needsUpdate ) {

			focalLength = this.focalLength;
			fov = this.fov;
			aspect = this.aspect;
			near = this.near;
			far = this.far;

			// Off-axis stereoscopic effect based on
			// http://paulbourke.net/stereographics/stereorender/

			var projectionMatrix = this.projectionMatrix.clone();
			var eyeSep = focalLength / 30 * 0.5;
			var eyeSepOnProjection = eyeSep * near / focalLength;
			var ymax = near * Math.tan( THREE.Math.degToRad( fov * 0.5 ) );
			var xmin, xmax;

			// translate xOffset

			eyeLeft.elements[ 12 ] = - eyeSep;
			eyeRight.elements[ 12 ] = eyeSep;

			// for left eye

			xmin = - ymax * aspect + eyeSepOnProjection;
			xmax = ymax * aspect + eyeSepOnProjection;

			projectionMatrix.elements[ 0 ] = 2 * near / ( xmax - xmin );
			projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraL.projectionMatrix.copy( projectionMatrix );

			// for right eye

			xmin = - ymax * aspect - eyeSepOnProjection;
			xmax = ymax * aspect - eyeSepOnProjection;

			projectionMatrix.elements[ 0 ] = 2 * near / ( xmax - xmin );
			projectionMatrix.elements[ 8 ] = ( xmax + xmin ) / ( xmax - xmin );

			this.cameraR.projectionMatrix.copy( projectionMatrix );

		}

		this.cameraL.matrixWorld.copy( this.matrixWorld ).multiply( eyeLeft );
		this.cameraR.matrixWorld.copy( this.matrixWorld ).multiply( eyeRight );

	};

} )();
