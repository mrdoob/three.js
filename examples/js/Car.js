/**
 * @author alteredq / http://alteredqualia.com/
 * @author Lewy Blue https://github.com/looeee
 *
 * INSTRUCTIONS: car.SetModel( model ) - the model must have 4 children called
 * wheelFrontLeft,  wheelFrontRight, wheelRearLeft, wheelRearRight
 * that will be automatically set to the 4 wheels. These can be any Object3D ( Group, Mesh etc. )
 *
 * The model is expected to follow real world car proportions. You can try unusual car types
 * but your results may be unexpected.
 *
 * Defaults below are for a Ferrari F50, taken from https://en.wikipedia.org/wiki/Ferrari_F50
 *
 */

THREE.Car = function ( maxSpeed, acceleration, brakePower, turningRadius, keys ) {

	// km/hr
	this.maxSpeed = maxSpeed || 312;
	var maxSpeedReverse = - this.maxSpeed * 0.25;

	// m/s
	this.acceleration = acceleration || 19;
	var accelerationReverse = this.acceleration * 0.5;

	// metres
	this.turningRadius = turningRadius || 12;

	// m/s
	var deceleration = this.acceleration * 2;

	// multiplied with deceleration, so breaking deceleration = ( acceleration * 2 * brakePower ) m/s
	this.brakePower = brakePower || 10;

	// exposed so that a user can use this for various effect, e.g blur
	// km / hr
	this.speed = 0;

	// keys used to control car - by default the arrow keys and space to brake
	this.keys = keys || { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, BRAKE: 32 };

	var steeringWheelSpeed = 1.5;
	var maxSteeringRotation = 0.6;

	var acceleration = 0;

	var wheelOrientation = 0;
	var carOrientation = 0;

	var root = null;

	var frontLeftWheelRoot = null;
	var frontRightWheelRoot = null;

	var frontLeftWheel = new THREE.Group();
	var frontRightWheel = new THREE.Group();
	var backLeftWheel = null;
	var backRightWheel = null;

	var wheelDiameter = 1;
	var length = 1;

	var loaded = false;

	var controls = {

		brake: false,
		moveForward: false,
		moveBackward: false,
		moveLeft: false,
		moveRight: false

	};

	var self = this;

	function onKeyDown( event ) {

		switch ( event.keyCode ) {

			case self.keys.BRAKE:
				controls.brake = true;
				controls.moveForward = false;
				controls.moveBackward = false;
				break;

			case self.keys.UP: controls.moveForward = true; break;

			case self.keys.DOWN: controls.moveBackward = true; break;

			case self.keys.LEFT: controls.moveLeft = true; break;

			case self.keys.RIGHT: controls.moveRight = true; break;

		}

	}

	function onKeyUp( event ) {

		switch ( event.keyCode ) {

			case self.keys.BRAKE: controls.brake = false; break;

			case self.keys.UP: controls.moveForward = false; break;

			case self.keys.DOWN: controls.moveBackward = false; break;

			case self.keys.LEFT: controls.moveLeft = false; break;

			case self.keys.RIGHT: controls.moveRight = false; break;

		}

	}

	document.addEventListener( 'keydown', onKeyDown, false );
	document.addEventListener( 'keyup', onKeyUp, false );

	this.dispose = function () {

		document.removeEventListener( 'keydown', onKeyDown, false );
		document.removeEventListener( 'keyup', onKeyUp, false );

	};

	this.update = function ( delta ) {

		if ( ! loaded ) return;

		var brakingDeceleration = 1;

		if ( controls.brake ) brakingDeceleration = this.brakePower;

		if ( controls.moveForward ) {

			this.speed = THREE.Math.clamp( this.speed + delta * this.acceleration, maxSpeedReverse, this.maxSpeed );
			acceleration = THREE.Math.clamp( acceleration + delta, - 1, 1 );

		}

		if ( controls.moveBackward ) {

			this.speed = THREE.Math.clamp( this.speed - delta * accelerationReverse, maxSpeedReverse, this.maxSpeed );
			acceleration = THREE.Math.clamp( acceleration - delta, - 1, 1 );

		}

		if ( controls.moveLeft ) {

			wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * steeringWheelSpeed, - maxSteeringRotation, maxSteeringRotation );

		}

		if ( controls.moveRight ) {

			wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * steeringWheelSpeed, - maxSteeringRotation, maxSteeringRotation );

		}

		// this.speed decay
		if ( ! ( controls.moveForward || controls.moveBackward ) ) {

			if ( this.speed > 0 ) {

				var k = exponentialEaseOut( this.speed / this.maxSpeed );

				this.speed = THREE.Math.clamp( this.speed - k * delta * deceleration * brakingDeceleration, 0, this.maxSpeed );
				acceleration = THREE.Math.clamp( acceleration - k * delta, 0, 1 );

			} else {

				var k = exponentialEaseOut( this.speed / maxSpeedReverse );

				this.speed = THREE.Math.clamp( this.speed + k * delta * accelerationReverse * brakingDeceleration, maxSpeedReverse, 0 );
				acceleration = THREE.Math.clamp( acceleration + k * delta, - 1, 0 );

			}

		}

		// steering decay
		if ( ! ( controls.moveLeft || controls.moveRight ) ) {

			if ( wheelOrientation > 0 ) {

				wheelOrientation = THREE.Math.clamp( wheelOrientation - delta * steeringWheelSpeed, 0, maxSteeringRotation );

			} else {

				wheelOrientation = THREE.Math.clamp( wheelOrientation + delta * steeringWheelSpeed, - maxSteeringRotation, 0 );

			}

		}

		var forwardDelta = this.speed * delta;

		carOrientation += ( forwardDelta * this.turningRadius * 0.02 ) * wheelOrientation;

		// movement of car
		root.position.x += Math.sin( carOrientation ) * forwardDelta * length;
		root.position.z += Math.cos( carOrientation ) * forwardDelta * length;

		// angle of car
		root.rotation.y = carOrientation;

		// wheels rolling
		var angularSpeedRatio = 2 / wheelDiameter;

		var wheelDelta = forwardDelta * angularSpeedRatio * length;

		frontLeftWheel.rotation.x += wheelDelta;
		frontRightWheel.rotation.x += wheelDelta;
		backLeftWheel.rotation.x += wheelDelta;
		backRightWheel.rotation.x += wheelDelta;

		// front wheels rotation while steering
		frontLeftWheelRoot.rotation.y = wheelOrientation;
		frontRightWheelRoot.rotation.y = wheelOrientation;

	};

	this.setModel = function ( model ) {

		root = model;

		setupWheels();
		computeDimensions();

		loaded = true;

	};

	function setupWheels() {

		frontLeftWheelRoot = root.getObjectByName( 'wheelFrontLeft' );
		frontRightWheelRoot = root.getObjectByName( 'wheelFrontRight' );
		backLeftWheel = root.getObjectByName( 'wheelRearLeft' );
		backRightWheel = root.getObjectByName( 'wheelRearRight' );

		while ( frontLeftWheelRoot.children.length > 0 ) frontLeftWheel.add( frontLeftWheelRoot.children[ 0 ] );
		while ( frontRightWheelRoot.children.length > 0 ) frontRightWheel.add( frontRightWheelRoot.children[ 0 ] );

		frontLeftWheelRoot.add( frontLeftWheel );
		frontRightWheelRoot.add( frontRightWheel );

	}

	function computeDimensions() {

		var bb = new THREE.Box3().setFromObject( frontLeftWheelRoot );

		var size = bb.getSize();

		wheelDiameter = Math.max( size.x, size.y, size.z );

		bb.setFromObject( root );

		size = bb.getSize();
		length = Math.max( size.x, size.y, size.z );

	}

	function exponentialEaseOut( k ) {

		return k === 1 ? 1 : - Math.pow( 2, - 10 * k ) + 1;

	}

};

