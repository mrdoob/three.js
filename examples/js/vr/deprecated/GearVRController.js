/**
 * @author servinlp
 */

THREE.GearVRController = function () {

	THREE.Object3D.call( this );

	var scope = this;
	var gamepad;

	var axes = [ 0, 0 ];
	var touchpadIsPressed = false;
	var triggerIsPressed = false;
	var angularVelocity = new THREE.Vector3();

	this.matrixAutoUpdate = true;

	function findGamepad() {

		var gamepads = navigator.getGamepads && navigator.getGamepads();

		for ( var i = 0; i < 4; i ++ ) {

			var gamepad = gamepads[ i ];

			if ( gamepad && ( gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' ) ) {

				return gamepad;

			}

		}

	}

	this.getGamepad = function () {

		return gamepad;

	};

	this.getTouchpadState = function () {

		return touchpadIsPressed;

	};

	this.update = function () {

		gamepad = findGamepad();

		if ( gamepad !== undefined && gamepad.pose !== undefined ) {

			var pose = gamepad.pose;

			if ( pose === null ) return; // no user action yet

			//  orientation

			if ( pose.orientation !== null ) scope.quaternion.fromArray( pose.orientation );

			scope.updateMatrix();
			scope.visible = true;

			// angular velocity

			if ( pose.angularVelocity !== null && ! angularVelocity.equals( pose.angularVelocity ) ) {

				angularVelocity.fromArray( pose.angularVelocity );
				scope.dispatchEvent( { type: 'angularvelocitychanged', angularVelocity: angularVelocity } );

			}

			// axes (touchpad)

			if ( axes[ 0 ] !== gamepad.axes[ 0 ] || axes[ 1 ] !== gamepad.axes[ 1 ] ) {

				axes[ 0 ] = gamepad.axes[ 0 ];
				axes[ 1 ] = gamepad.axes[ 1 ];
				scope.dispatchEvent( { type: 'axischanged', axes: axes } );

			}

			// button (touchpad)

			if ( touchpadIsPressed !== gamepad.buttons[ 0 ].pressed ) {

				touchpadIsPressed = gamepad.buttons[ 0 ].pressed;
				scope.dispatchEvent( { type: touchpadIsPressed ? 'touchpaddown' : 'touchpadup', axes: axes } );

			}


			// trigger

			if ( triggerIsPressed !== gamepad.buttons[ 1 ].pressed ) {

				triggerIsPressed = gamepad.buttons[ 1 ].pressed;
				scope.dispatchEvent( { type: triggerIsPressed ? 'triggerdown' : 'triggerup' } );

			}

		// app button not available, reserved for use by the browser

		} else {

			scope.visible = false;

		}

	};

	// DEPRECATED

	this.getTouchPadState = function () {

		console.warn( 'THREE.GearVRController: getTouchPadState() is now getTouchpadState()' );
		return touchpadIsPressed;

	};

	this.setHand = function () {

		console.warn( 'THREE.GearVRController: setHand() has been removed.' );

	};

};

THREE.GearVRController.prototype = Object.create( THREE.Object3D.prototype );
THREE.GearVRController.prototype.constructor = THREE.GearVRController;
