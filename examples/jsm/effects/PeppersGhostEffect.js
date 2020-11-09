import {
	PerspectiveCamera,
	Quaternion,
	Vector3
} from "../../../build/three.module.js";

/**
 * peppers ghost effect based on http://www.instructables.com/id/Reflective-Prism/?ALLSTEPS
 */

var PeppersGhostEffect = function ( renderer ) {

	var scope = this;

	scope.cameraDistance = 15;
	scope.reflectFromAbove = false;

	// Internals
	var _halfWidth, _width, _height;

	var _cameraF = new PerspectiveCamera(); //front
	var _cameraB = new PerspectiveCamera(); //back
	var _cameraL = new PerspectiveCamera(); //left
	var _cameraR = new PerspectiveCamera(); //right

	var _position = new Vector3();
	var _quaternion = new Quaternion();
	var _scale = new Vector3();

	// Initialization
	renderer.autoClear = false;

	this.setSize = function ( width, height ) {

		_halfWidth = width / 2;
		if ( width < height ) {

			_width = width / 3;
			_height = width / 3;

		} else {

			_width = height / 3;
			_height = height / 3;

		}

		renderer.setSize( width, height );

	};

	this.render = function ( scene, camera ) {

		scene.updateMatrixWorld();

		if ( camera.parent === null ) camera.updateMatrixWorld();

		camera.matrixWorld.decompose( _position, _quaternion, _scale );

		// front
		_cameraF.position.copy( _position );
		_cameraF.quaternion.copy( _quaternion );
		_cameraF.translateZ( scope.cameraDistance );
		_cameraF.lookAt( scene.position );

		// back
		_cameraB.position.copy( _position );
		_cameraB.quaternion.copy( _quaternion );
		_cameraB.translateZ( - ( scope.cameraDistance ) );
		_cameraB.lookAt( scene.position );
		_cameraB.rotation.z += 180 * ( Math.PI / 180 );

		// left
		_cameraL.position.copy( _position );
		_cameraL.quaternion.copy( _quaternion );
		_cameraL.translateX( - ( scope.cameraDistance ) );
		_cameraL.lookAt( scene.position );
		_cameraL.rotation.x += 90 * ( Math.PI / 180 );

		// right
		_cameraR.position.copy( _position );
		_cameraR.quaternion.copy( _quaternion );
		_cameraR.translateX( scope.cameraDistance );
		_cameraR.lookAt( scene.position );
		_cameraR.rotation.x += 90 * ( Math.PI / 180 );


		renderer.clear();
		renderer.setScissorTest( true );

		renderer.setScissor( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), ( _height * 2 ), _width, _height );

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _cameraB );

		} else {

			renderer.render( scene, _cameraF );

		}

		renderer.setScissor( _halfWidth - ( _width / 2 ), 0, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ), 0, _width, _height );

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _cameraF );

		} else {

			renderer.render( scene, _cameraB );

		}

		renderer.setScissor( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );
		renderer.setViewport( _halfWidth - ( _width / 2 ) - _width, _height, _width, _height );

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _cameraR );

		} else {

			renderer.render( scene, _cameraL );

		}

		renderer.setScissor( _halfWidth + ( _width / 2 ), _height, _width, _height );
		renderer.setViewport( _halfWidth + ( _width / 2 ), _height, _width, _height );

		if ( scope.reflectFromAbove ) {

			renderer.render( scene, _cameraL );

		} else {

			renderer.render( scene, _cameraR );

		}

		renderer.setScissorTest( false );

	};


};

export { PeppersGhostEffect };
