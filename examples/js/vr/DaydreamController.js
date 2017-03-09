/**
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.DaydreamController = function () {

	THREE.Object3D.call( this );

	var scope = this;
	var gamepad;

	var axes = [ 0, 0 ];
	var touchpadIsPressed = false;
	var angularVelocity = new THREE.Vector3();

	this.matrixAutoUpdate = false;

	function findGamepad() {

		// iterate across gamepads as the Daydream Controller may not be in position 0

		var gamepads = navigator.getGamepads();

		for ( var i = 0; i < 4; i ++ ) {

			var gamepad = gamepads[ i ];

			if ( gamepad && ( gamepad.id === 'Daydream Controller' ) ) {

				return gamepad;

			}

		}

	}

	this.getGamepad = function () {

		return gamepad;

	};

	this.getTouchPadState = function () {

		return touchpadIsPressed;

	};

	this.update = function () {

		gamepad = findGamepad();

		if ( gamepad !== undefined && gamepad.pose !== undefined ) {

			if ( pose === null ) return; // no user action yet

			var pose = gamepad.pose;

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
				scope.dispatchEvent( { type: touchpadIsPressed ? 'touchpaddown' : 'touchpadup' } );

			}

			// app button not available, reserved for use by the browser

		} else {

			scope.visible = false;

		}

	};

};

THREE.DaydreamController.prototype = Object.create( THREE.Object3D.prototype );
THREE.DaydreamController.prototype.constructor = THREE.DaydreamController;
