/**
 * @author alteredq / http://alteredqualia.com/
 * @authod mrdoob / http://mrdoob.com/
 * @authod arodic / http://aleksandarrodic.com/
 * @authod fonserbc / http://fonserbc.github.io/
 *
 * Off-axis stereoscopic effect based on http://paulbourke.net/stereographics/stereorender/
 */

THREE.StereoEffect = function ( renderer ) {

	// API

	var scope = this;

	this.eyeSeparation = 3;
	this.focalLength = 15; 	// Distance to the non-parallax or projection plane

	Object.defineProperties( this, {
		separation: {
			get: function () {
				return scope.eyeSeparation;
			},
			set: function ( value ) {
				console.warn( 'THREE.StereoEffect: .separation is now .eyeSeparation.' );
				scope.eyeSeparation = value;
			}
		},
		targetDistance: {
			get: function () {
				return scope.focalLength;
			},
			set: function ( value ) {
				console.warn( 'THREE.StereoEffect: .targetDistance is now .focalLength.' );
				scope.focalLength = value;
			}
		}
	} );

	// internals

	var _width, _height;

	var _position = new THREE.Vector3();
	var _quaternion = new THREE.Quaternion();
	var _scale = new THREE.Vector3();

	var _cameraL = new THREE.PerspectiveCamera();
	var _cameraR = new THREE.PerspectiveCamera();

	var _fov;
	var _outer, _inner, _top, _bottom;
	var _ndfl, _halfFocalWidth, _halfFocalHeight;
	var _innerFactor, _outerFactor;

	// initialization

	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_width = width / 2;
		_height = height;

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === undefined ) camera.updateMatrixWorld();
	
		camera.matrixWorld.decompose( _position, _quaternion, _scale );

		// Effective fov of the camera

		_fov = THREE.Math.radToDeg( 2 * Math.atan( Math.tan( THREE.Math.degToRad( camera.fov ) * 0.5 ) / camera.zoom ) );

		_ndfl = camera.near / this.focalLength;
		_halfFocalHeight = Math.tan( THREE.Math.degToRad( _fov ) * 0.5 ) * this.focalLength;
		_halfFocalWidth = _halfFocalHeight * 0.5 * camera.aspect;

		_top = _halfFocalHeight * _ndfl;
		_bottom = -_top;
		_innerFactor = ( _halfFocalWidth + this.eyeSeparation / 2.0 ) / ( _halfFocalWidth * 2.0 );
		_outerFactor = 1.0 - _innerFactor;

		_outer = _halfFocalWidth * 2.0 * _ndfl * _outerFactor;
		_inner = _halfFocalWidth * 2.0 * _ndfl * _innerFactor;

		// left

		_cameraL.projectionMatrix.makeFrustum(
			-_outer,
			_inner,
			_bottom,
			_top,
			camera.near,
			camera.far
		);

		_cameraL.position.copy( _position );
		_cameraL.quaternion.copy( _quaternion );
		_cameraL.translateX( - this.eyeSeparation / 2.0 );

		// right

		_cameraR.projectionMatrix.makeFrustum(
			-_inner,
			_outer,
			_bottom,
			_top,
			camera.near,
			camera.far
		);

		_cameraR.position.copy( _position );
		_cameraR.quaternion.copy( _quaternion );
		_cameraR.translateX( this.eyeSeparation / 2.0 );

		//

		renderer.clear();
		renderer.enableScissorTest( true );

		renderer.setScissor( 0, 0, _width, _height );
		renderer.setViewport( 0, 0, _width, _height );
		renderer.render( scene, _cameraL );

		renderer.setScissor( _width, 0, _width, _height );
		renderer.setViewport( _width, 0, _width, _height );
		renderer.render( scene, _cameraR );

		renderer.enableScissorTest( false );

	};

};
