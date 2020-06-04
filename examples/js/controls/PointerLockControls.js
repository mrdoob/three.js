console.warn( "THREE.PointerLockControls: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PointerLockControls = function ( camera, domElement ) {

	if ( domElement === undefined ) {

		console.warn( 'THREE.PointerLockControls: The second parameter "domElement" is now mandatory.' );
		domElement = document.body;

	}

	this.domElement = domElement;
	this.isLocked = false;

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

	var PI_2 = Math.PI / 2;

	var vec = new THREE.Vector3();

	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		euler.setFromQuaternion( camera.quaternion );

		euler.y -= movementX * 0.002;
		euler.x -= movementY * 0.002;

		euler.x = Math.max( - PI_2, Math.min( PI_2, euler.x ) );

		camera.quaternion.setFromEuler( euler );

		scope.dispatchEvent( changeEvent );

	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( lockEvent );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( unlockEvent );

			scope.isLocked = false;

		}

	}

	function onPointerlockError() {

		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );

	}

	this.connect = function () {

		document.addEventListener( 'mousemove', onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.disconnect = function () {

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );

	};

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () { // retaining this method for backward compatibility

		return camera;

	};

	this.getDirection = function () {

		var direction = new THREE.Vector3( 0, 0, - 1 );

		return function ( v ) {

			return v.copy( direction ).applyQuaternion( camera.quaternion );

		};

	}();

	this.moveForward = function ( distance ) {

		// move forward parallel to the xz-plane
		// assumes camera.up is y-up

		vec.setFromMatrixColumn( camera.matrix, 0 );

		vec.crossVectors( camera.up, vec );

		camera.position.addScaledVector( vec, distance );

	};

	this.moveRight = function ( distance ) {

		vec.setFromMatrixColumn( camera.matrix, 0 );

		camera.position.addScaledVector( vec, distance );

	};

	this.lock = function () {

		this.domElement.requestPointerLock();

	};

	this.unlock = function () {

		document.exitPointerLock();

	};

	this.connect();

};

THREE.PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.PointerLockControls.prototype.constructor = THREE.PointerLockControls;
