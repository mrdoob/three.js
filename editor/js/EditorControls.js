/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.EditorControls = function ( object, domElement ) {

	// API

	this.enabled = true;
	this.center = new THREE.Vector3();
	this.panSpeed = 0.002;
	this.zoomSpeed = 0.1;
	this.rotationSpeed = 0.005;

	// internals

	var scope = this;
	var vector = new THREE.Vector3();
	var delta = new THREE.Vector3();
	var box = new THREE.Box3();

	var STATE = { NONE: - 1, ROTATE: 0, ZOOM: 1, PAN: 2 };
	var state = STATE.NONE;

	var center = this.center;
	var normalMatrix = new THREE.Matrix3();
	var pointer = new THREE.Vector2();
	var pointerOld = new THREE.Vector2();
	var spherical = new THREE.Spherical();
	var sphere = new THREE.Sphere();

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

	// mouse

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;

		if ( event.button === 0 ) {

			state = STATE.ROTATE;

		} else if ( event.button === 1 ) {

			state = STATE.ZOOM;

		} else if ( event.button === 2 ) {

			state = STATE.PAN;

		}

		pointerOld.set( event.clientX, event.clientY );

		domElement.addEventListener( 'mousemove', onMouseMove, false );
		domElement.addEventListener( 'mouseup', onMouseUp, false );
		domElement.addEventListener( 'mouseout', onMouseUp, false );
		domElement.addEventListener( 'dblclick', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		pointer.set( event.clientX, event.clientY );

		var movementX = pointer.x - pointerOld.x;
		var movementY = pointer.y - pointerOld.y;

		if ( state === STATE.ROTATE ) {

			scope.rotate( delta.set( - movementX, - movementY, 0 ) );

		} else if ( state === STATE.ZOOM ) {

			scope.zoom( delta.set( 0, 0, movementY ) );

		} else if ( state === STATE.PAN ) {

			scope.pan( delta.set( - movementX, movementY, 0 ) );

		}

		pointerOld.set( event.clientX, event.clientY );

	}

	function onMouseUp( /* event */ ) {

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		event.preventDefault();

		// Normalize deltaY due to https://bugzilla.mozilla.org/show_bug.cgi?id=1392460
		scope.zoom( delta.set( 0, 0, event.deltaY > 0 ? 1 : - 1 ) );

	}

	function contextmenu( event ) {

		event.preventDefault();

	}

	this.dispose = function () {

		domElement.removeEventListener( 'contextmenu', contextmenu, false );
		domElement.removeEventListener( 'mousedown', onMouseDown, false );
		domElement.removeEventListener( 'wheel', onMouseWheel, false );

		domElement.removeEventListener( 'mousemove', onMouseMove, false );
		domElement.removeEventListener( 'mouseup', onMouseUp, false );
		domElement.removeEventListener( 'mouseout', onMouseUp, false );
		domElement.removeEventListener( 'dblclick', onMouseUp, false );

		domElement.removeEventListener( 'touchstart', touchStart, false );
		domElement.removeEventListener( 'touchmove', touchMove, false );

	};

	domElement.addEventListener( 'contextmenu', contextmenu, false );
	domElement.addEventListener( 'mousedown', onMouseDown, false );
	domElement.addEventListener( 'wheel', onMouseWheel, false );

	// touch

	var touches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];
	var prevTouches = [ new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3() ];

	var prevDistance = null;

	function touchStart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				prevDistance = touches[ 0 ].distanceTo( touches[ 1 ] );
				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}


	function touchMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		function getClosest( touch, touches ) {

			var closest = touches[ 0 ];

			for ( var i in touches ) {

				if ( closest.distanceTo( touch ) > touches[ i ].distanceTo( touch ) ) closest = touches[ i ];

			}

			return closest;

		}

		switch ( event.touches.length ) {

			case 1:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				touches[ 1 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				scope.rotate( touches[ 0 ].sub( getClosest( touches[ 0 ], prevTouches ) ).multiplyScalar( - 1 ) );
				break;

			case 2:
				touches[ 0 ].set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				touches[ 1 ].set( event.touches[ 1 ].pageX, event.touches[ 1 ].pageY, 0 ).divideScalar( window.devicePixelRatio );
				var distance = touches[ 0 ].distanceTo( touches[ 1 ] );
				scope.zoom( delta.set( 0, 0, prevDistance - distance ) );
				prevDistance = distance;


				var offset0 = touches[ 0 ].clone().sub( getClosest( touches[ 0 ], prevTouches ) );
				var offset1 = touches[ 1 ].clone().sub( getClosest( touches[ 1 ], prevTouches ) );
				offset0.x = - offset0.x;
				offset1.x = - offset1.x;

				scope.pan( offset0.add( offset1 ) );

				break;

		}

		prevTouches[ 0 ].copy( touches[ 0 ] );
		prevTouches[ 1 ].copy( touches[ 1 ] );

	}

	domElement.addEventListener( 'touchstart', touchStart, false );
	domElement.addEventListener( 'touchmove', touchMove, false );

};

THREE.EditorControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.EditorControls.prototype.constructor = THREE.EditorControls;
