/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author arodic / https://github.com/arodic
 */

THREE.PointerLockControls = function ( object, domElement ) {

	this.object = object;

	this.domElement = domElement || document.body;

	this.isLocked = false;

	// Reverse vertical motion
	this.reverseY = false;

	// Mouse movement sensitivity
	this.sensitivity = 0.002;

	// How far you can look vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0;
	this.maxPolarAngle = Math.PI;

	//
	// internals
	//

	var scope = this;

	var changeEvent = { type: 'change' };
	var lockEvent = { type: 'lock' };
	var unlockEvent = { type: 'unlock' };

	var direction = new THREE.Vector3( 0, 0, - 1 );
	var spherical = new THREE.Spherical();
	var tempVector = new THREE.Vector3();

	function onMouseMove( event ) {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		tempVector.copy( direction );
		tempVector.applyQuaternion( scope.object.quaternion );

		// angle from z-axis around y-axis
		spherical.setFromVector3( tempVector );

		spherical.theta -= movementX * scope.sensitivity;
		spherical.phi += movementY * scope.sensitivity * ( scope.reverseY ? -1 : 1 );

		// restrict phi to be between desired limits
		spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

		spherical.makeSafe();

		tempVector.setFromSpherical( spherical );

		scope.object.lookAt( tempVector.add( scope.object.position ) );

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

		scope.dispatchEvent( changeEvent );

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

	this.getObject = function () {

		console.warn( 'THREE.PointerLockControls: getObject() has been deprecated.' );

		return scope.object;

	};

	this.getDirection = function ( v ) {

		v = v || new THREE.Vector3();

		v.copy( direction ).applyQuaternion( scope.object.quaternion );

		return v;

	};

	this.getPolarAngle = function () {

		return spherical.phi;

	};

	this.getAzimuthalAngle = function () {

		return spherical.theta;

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
