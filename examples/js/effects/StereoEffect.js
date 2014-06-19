/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 */

THREE.StereoEffect = function ( renderer ) {

	// API

	this.separation = 6;
	this.targetDistance = 100;

	// internals

	var _width, _height;

	var _cameraL = new THREE.PerspectiveCamera();
	var _cameraR = new THREE.PerspectiveCamera();
	var _target = new THREE.Vector3();

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		_target.set( 0, 0, - this.targetDistance );
		_target.applyQuaternion( camera.quaternion );
		_target.add( camera.position );

		// left

		_cameraL.fov = camera.fov;
		_cameraL.aspect = 0.5 * camera.aspect;
		_cameraL.updateProjectionMatrix();

		_cameraL.near = camera.near;
		_cameraL.far = camera.far;

		_cameraL.position.copy( camera.position );
		_cameraL.translateX( - this.separation );
		_cameraL.lookAt( _target );

		// right

		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.near = camera.near;
		_cameraR.far = camera.far;

		_cameraR.position.copy( camera.position );
		_cameraR.translateX( this.separation );
		_cameraR.lookAt( _target );

		//

		renderer.setViewport( 0, 0, _width * 2, _height );
		renderer.clear();

		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, _cameraR, false );

	};

};
