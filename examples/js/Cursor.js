/**
 * @author dmarcos - diego.marcos@gmail.com
 *
 * Reusable cursor for 3D scenes
 *
 */

THREE.Cursor = function ( object, renderer ) {

	THREE.Object3D.call( this );

	var scope = this;

	var top = Math.tan( THREE.Math.degToRad( object.fov * 0.5 ) ) * object.near;
	var bottom = - top;
	var left = object.aspect * bottom;
	var right = object.aspect * top;
	var near = object.near;
	var far = object.far;

	var cursorPosition = new THREE.Vector3();
	var pixelsToDegreesFactor = 0.00030;

	this.object = object;
	this.lock = false;
	this.maxFOV = 30;
	this.deltaEuler = new THREE.Euler();
	this.mouseDeltaX = 0;
	this.mouseDeltaY = 0;

	this.pointerLocked = false;

	this.camera = new THREE.OrthographicCamera( left, right, top, bottom, near, far );
	this.scene = new THREE.Scene();
	this.renderer = renderer;

	this.domElement = ( renderer !== undefined ) ? renderer.domElement : document;
	this.domElement.style.cursor = 'none';

	this.pointer = new THREE.Mesh(
		new THREE.SphereGeometry( 0.02, 0.02, 0.02 ),
		new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } )
	);
	this.pointer.position.z = -75;
	this.add( this.pointer );
	this.scene.add( this );

	// Initialization of local variables
	// To avoid allocations in every frame
	this.mouseVector = new THREE.Vector3(0, 0, 0);
	this.deltaQuaternion = new THREE.Quaternion();
	this.deltaMouseQuat = new THREE.Quaternion();

	// update
	// It stores the camera orientation change between frames
	this.cameraDeltaQuaternion = new THREE.Quaternion();
	// It stores the inverse of the camera orientation
	this.cameraInverse = new THREE.Quaternion();

	// updateMouseQuaternion
	this.xDeltaQuaternion = new THREE.Quaternion();
	this.yDeltaQuaternion = new THREE.Quaternion();
	this.mouseMoveQuat = new THREE.Quaternion();
	this.xAxis = new THREE.Vector3(1, 0, 0);
	this.yAxis = new THREE.Vector3(0, 1, 0);
	this.mouseQuat = new THREE.Quaternion();

	this.update = function() {
		var deltaAngle;
		var cameraInverse = scope.cameraInverse;
		// If the pointer is locked we move the cursor radially
		if ( scope.pointerLocked ) {
			// First frame we initialize variables
			if ( !scope.previousCameraQuat ) {
				scope.deltaMouseQuat.copy( scope.object.quaternion );
				scope.previousCameraQuat = scope.object.quaternion.clone();
			}
			// Angle between camera and cursor
			deltaAngle = quaternionsAngle( scope.object.quaternion, scope.quaternion ) * ( 180 / Math.PI ) ;

			// It calculates how much the camera orientation has changed since last frame
			// diff * q1 = q2  --->  diff = q2 * inverse(q1)
			// where:  inverse(q1) = conjugate(q1) / abs(q1)
			// and:  conjugate( quaternion(re, i, j, k) ) = quaternion(re, -i, -j, -k)
			// http://stackoverflow.com/questions/22157435/difference-between-the-two-quaternions
			cameraInverse.copy( scope.object.quaternion ).inverse();
			scope.cameraDeltaQuaternion.copy( scope.previousCameraQuat ).multiply( cameraInverse );

			/**********/
			// PING PONG
			// If the cursor goes out of FOV it syncs camera and cursor oritentation
			if ( deltaAngle >= scope.maxFOV ) {
				scope.deltaQuaternion.multiply( scope.cameraDeltaQuaternion );
			}
			// PING PONG

			// // STICKY
			// if ( deltaAngle >= this.maxFOV ) {
			// 	scope.lock = true;
			// }
			// if ( scope.lock ) {
			//	scope.deltaQuaternion.multiply( scope.cameraDeltaQuaternion );
			// }
			// // STICKY
			/**********/

			scope.updateMouseQuaternion();

			// New cursor quaternion
			scope.quaternion.copy( scope.deltaQuaternion ).inverse();
			scope.quaternion.multiply( scope.deltaMouseQuat );

			// We copy current quaternion in previous for the next frame
			scope.previousCameraQuat.copy( scope.object.quaternion );
			scope.matrixAutoUpdate = false;
			scope.updateMatrix();

		} else { // If the pointer is not locked we move the pointer on a 2d plane

			scope.matrixAutoUpdate = true;
			scope.pointer.position.x = scope.mouseVector.x;
			scope.pointer.position.y = -scope.mouseVector.y;
			scope.render();

		}

	};

	this.updateMouseQuaternion = function() {
		var mouseQuat = scope.mouseQuat;
		var deltaAngle;
		var xDeltaQuaternion = scope.xDeltaQuaternion;
		var yDeltaQuaternion = scope.yDeltaQuaternion;
		var mouseMoveQuat = scope.mouseMoveQuat;
		var xAxis = scope.xAxis.set( 1, 0, 0 );
		var yAxis = scope.yAxis.set( 0, 1, 0 );
		var xInc = scope.mouseDeltaX;
		var yInc = scope.mouseDeltaY;
		var incSign;

		if ( xInc !== 0 || yInc !==0 ) {

			scope.object.localToWorld( xAxis );
			xDeltaQuaternion.setFromAxisAngle( xAxis, xInc * 2 * Math.PI );

			scope.object.localToWorld( yAxis );
			yDeltaQuaternion.setFromAxisAngle( yAxis, yInc * 2 * Math.PI );

			// Move the cursor in the two different axis of the polar coordinates: θ and φ
			mouseMoveQuat.copy( xDeltaQuaternion ).multiply( yDeltaQuaternion );
			// Test if the mouse delta moves the cursor out of FOV
			mouseQuat.copy( mouseMoveQuat ).multiply( scope.quaternion );
			// Angle between camera orientation and new cursor orientation
			deltaAngle = quaternionsAngle( scope.object.quaternion, mouseQuat ) * ( 180 / Math.PI );
			// If the cursor stays in FOV we apply the delta
			if (deltaAngle < scope.maxFOV) {
				scope.deltaMouseQuat.copy( mouseMoveQuat ).multiply( scope.quaternion );
				scope.deltaQuaternion = new THREE.Quaternion();
				// // STICKY
				// this.lock = false;
				// // STICKY
			}

			scope.mouseDeltaX = 0;
			scope.mouseDeltaY = 0;
		}
	};

	this.render = function() {
		if ( scope.pointerLocked ) {
			return;
		}
		var autoClear = scope.renderer.autoClear;
		if ( scope.parent !== scope.scene ) {
			storeParentScene();
			scope.parent.remove( scope );
			scope.scene.add( scope );
		}
		scope.renderer.autoClear = false;
		scope.renderer.render( scope.scene, scope.camera );
		scope.renderer.autoClear = autoClear;
	};

	function updateScreenPosition( e ) {
		// It converts from screen to camera coordinates
		var mouseX = ( e.clientX / window.innerWidth ) * 2 - 1;
		var mouseY = ( e.clientY / window.innerHeight ) * 2 - 1;

		// cursor position in camera coordinates
		cursorPosition.copy( scope.pointer.position );
		cursorPosition.project( scope.camera );

		scope.mouseVector.set( mouseX, mouseY, cursorPosition.z );
		scope.mouseVector.unproject( scope.camera );
	}

	function updateRadialPosition( e ) {
		var movementX = e.movementX ||
				e.mozMovementX ||
				e.webkitMovementX || 0;

		var movementY = e.movementY ||
				e.mozMovementY ||
				e.webkitMovementY || 0;

		scope.mouseDeltaX -= movementY * pixelsToDegreesFactor;
		scope.mouseDeltaY -= movementX * pixelsToDegreesFactor;
	}

	function quaternionsAngle(q1, q2) {
		var v1 = new THREE.Vector3( 0, 0, -1 );
		var v2 = new THREE.Vector3( 0, 0, -1 );
		v1.applyQuaternion(q1);
		v2.applyQuaternion(q2);
		return v1.angleTo(v2);
	}

	function onMouseMove( e ) {
		if ( scope.pointerLocked ) {
			if ( scope.mouseDown === true ) {
				return;
			}
			// The cursor moves radially around the user
			updateRadialPosition ( e );
		} else {
			// The cursor moves on the flat screen
			updateScreenPosition ( e )
		}
	}

	function resetPivot( object ) {
		scope.position.copy( object.position );
		scope.quaternion.copy( object.quaternion );
		scope.deltaQuaternion = new THREE.Quaternion();
	}

	function pointerLockChanged() {
		scope.pointerLocked =
			document.pointerLockElement === scope.domElement ||
			document.mozPointerLockElement === scope.domElement ||
			document.webkitPointerLockElement === scope.domElement;

		storeParentScene();

		if ( scope.pointerLocked === true ) {
			resetPivot( scope.object );
			scope.scene.remove( scope );
			scope.parentScene.add( scope );
			scope.pointer.scale.set( 50, 50, 50 );
			scope.previousCameraQuat = false;
		} else {
			resetPivot( scope.camera );
			scope.parentScene.remove( scope );
			scope.scene.add( scope );
			scope.pointer.scale.set( 1, 1, 1 );
			scope.pointerLocked = false;
		}
	}

	function onMouseUp() {
		scope.mouseDown = false;
	}

	function onMouseDown() {
		scope.mouseDown = true;
		scope.dispatchEvent( { type: 'click' } );
	}

	function storeParentScene() {
		if ( !scope.parentScene && scope.parent !== scope.scene ) {
			scope.parentScene = scope.parent;
		}
	}

	this.domElement.addEventListener( 'mousemove', onMouseMove );
	this.domElement.addEventListener( 'mouseup', onMouseUp, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );

	document.addEventListener( 'pointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'mozpointerlockchange', pointerLockChanged, false );
	document.addEventListener( 'webkitpointerlockchange', pointerLockChanged, false );

};

THREE.Cursor.prototype = Object.create( THREE.Object3D.prototype );
