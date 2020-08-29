import * as THREE from '../../build/three.module.js';

import { Controls } from '../../examples/jsm/controls/Controls.js';

function EditorControls( object, domElement ) {

	Controls.call( this, domElement );

	// API

	this.center = new THREE.Vector3();
	this.panSpeed = 0.002;
	this.zoomSpeed = 0.1;
	this.rotationSpeed = 0.005;

	// internals

	var scope = this;
	var vector = new THREE.Vector3();
	var delta = new THREE.Vector3();
	var box = new THREE.Box3();

	var center = this.center;
	var normalMatrix = new THREE.Matrix3();
	var spherical = new THREE.Spherical();
	var sphere = new THREE.Sphere();

	var touches = [
		new THREE.Vector3(),
		new THREE.Vector3()
	]

	var prevTouches = [
		new THREE.Vector3(),
		new THREE.Vector3()
	]

	// events

	var changeEvent = { type: 'change' };

	this.focus = function ( target ) {

		var distance;

		box.setFromObject( target );

		if ( box.isEmpty() === false ) {

			box.getCenter( center );
			distance = box.getBoundingSphere( sphere ).radius;

		} else {

			// Focusing on an Group, AmbientLight, etc

			center.setFromMatrixPosition( target.matrixWorld );
			distance = 0.1;

		}

		delta.set( 0, 0, 1 );
		delta.applyQuaternion( object.quaternion );
		delta.multiplyScalar( distance * 4 );

		object.position.copy( center ).add( delta );

		scope.dispatchEvent( changeEvent );

	};

	this.pan = function ( delta ) {

		var distance = object.position.distanceTo( center );

		delta.multiplyScalar( distance * scope.panSpeed );
		delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

		object.position.add( delta );
		center.add( delta );

		scope.dispatchEvent( changeEvent );

	};

	this.zoom = function ( delta ) {

		var distance = object.position.distanceTo( center );

		delta.multiplyScalar( distance * scope.zoomSpeed );

		if ( delta.length() > distance ) return;

		delta.applyMatrix3( normalMatrix.getNormalMatrix( object.matrix ) );

		object.position.add( delta );

		scope.dispatchEvent( changeEvent );

	};

	this.rotate = function ( delta ) {

		vector.copy( object.position ).sub( center );

		spherical.setFromVector3( vector );

		spherical.theta += delta.x * scope.rotationSpeed;
		spherical.phi += delta.y * scope.rotationSpeed;

		spherical.makeSafe();

		vector.setFromSpherical( spherical );

		object.position.copy( center ).add( vector );

		object.lookAt( center );

		scope.dispatchEvent( changeEvent );

	};

	function _onContextMenu( event ) {

		event.preventDefault();

	}

	function _onWheel( event ) {

		event.preventDefault();

		// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
		scope.zoom( delta.set( 0, 0, event.deltaY > 0 ? 1 : - 1 ) );

	}

	function _onControlPointerMove( event ) {

		const pointers = event.pointers;

		switch ( pointers.length ) {

			case 1: // Single pointer gestures

				if ( pointers[ 0 ].button === 0 ) {

					scope.rotate( delta.set( - pointers[ 0 ].movement.x, - pointers[ 0 ].movement.y, 0 ) );

				} else if ( pointers[ 0 ].button === 1 ) {

					scope.zoom( delta.set( 0, 0, pointers[ 0 ].movement.y ) );

				} else if ( pointers[ 0 ].button === 2 ) {

					scope.pan( delta.set( - pointers[ 0 ].movement.x, pointers[ 0 ].movement.y, 0 ) );

				}

				break;

			case 2: // Two pointer gestures

				prevTouches[ 0 ].set( pointers[ 0 ].previous.x, pointers[ 0 ].previous.y, 0 ).divideScalar( window.devicePixelRatio );
				prevTouches[ 1 ].set( pointers[ 1 ].previous.x, pointers[ 1 ].previous.y, 0 ).divideScalar( window.devicePixelRatio );
				var prevDistance = prevTouches[ 0 ].distanceTo( prevTouches[ 1 ] );

				touches[ 0 ].set( pointers[ 0 ].current.x, pointers[ 0 ].current.y, 0 ).divideScalar( window.devicePixelRatio );
				touches[ 1 ].set( pointers[ 1 ].current.x, pointers[ 1 ].current.y, 0 ).divideScalar( window.devicePixelRatio );
				var distance = touches[ 0 ].distanceTo( touches[ 1 ] );

				scope.zoom( delta.set( 0, 0, prevDistance - distance ) );

				var offset0 = touches[ 0 ].clone().sub( prevTouches[ 0 ] );
				var offset1 = touches[ 1 ].clone().sub( prevTouches[ 1 ] );
				offset0.x = - offset0.x;
				offset1.x = - offset1.x;

				scope.pan( offset0.add( offset1 ) );

				break;

		}

	}

	this.addEventListener( 'contextmenu', _onContextMenu );
	this.addEventListener( 'wheel', _onWheel );
	this.addEventListener( 'controlpointermove', _onControlPointerMove );

}

EditorControls.prototype = Object.create( Controls.prototype );
EditorControls.prototype.constructor = EditorControls;

export { EditorControls };
