/**
 * @author alteredq / http://alteredqualia.com/
 */

THREE.CrosseyedEffect = function ( renderer ) {

	// API

	this.separation = 10;

	// internals

	var _width, _height;

	var _cameraL = new THREE.PerspectiveCamera();
	_cameraL.target = new THREE.Vector3();

	var _cameraR = new THREE.PerspectiveCamera();
	_cameraR.target = new THREE.Vector3();

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		// left

		_cameraL.fov = camera.fov;
		_cameraL.aspect = 0.5 * camera.aspect;
		_cameraL.near = camera.near;
		_cameraL.far = camera.far;
		_cameraL.updateProjectionMatrix();

		_cameraL.position.copy( camera.position );
		_cameraL.target.copy( camera.target );
		_cameraL.translateX( this.separation );
		_cameraL.lookAt( _cameraL.target );

		// right

		_cameraR.near = camera.near;
		_cameraR.far = camera.far;

		_cameraR.projectionMatrix = _cameraL.projectionMatrix;

		_cameraR.position.copy( camera.position );
		_cameraR.target.copy( camera.target );
		_cameraR.translateX( - this.separation );
		_cameraR.lookAt( _cameraR.target );

		//

		renderer.clear();

		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, _cameraR, false );

	};

};
