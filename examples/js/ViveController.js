/**
 * @author mrdoob / http://mrdoob.com
 * @author stewdio / http://stewd.io
 */

THREE.ViveController = function( id ) {

	THREE.Object3D.call( this );

	var
	scope = this,
	gamepad,
	axes = [ 0, 0 ],
	thumbpadIsPressed = false,
	triggerIsPressed = false,
	gripsArePressed = false,
	menuIsPressed = false;

	function dispatchViveControllerEvent( name, custom ) {

		var data = {};

		data.id = id;
		data.gamepad = gamepad;
		data.instance = scope;
		if ( custom !== undefined ) Object.assign( data, custom );
		window.dispatchEvent( new CustomEvent( 'viveController' + name, { detail: data } ) );

	}

	this.matrixAutoUpdate = false;
	this.standingMatrix = new THREE.Matrix4();
	this.getGamepad = function() {

		return gamepad;

	}
	this.getButtonState = function( button ) {

		return scope[ button + ( button === 'grips' ? 'ArePressed' : 'IsPressed' ) ];

	}
	this.update = function() {

		var pose;

		gamepad = navigator.getGamepads()[ id ];
		if ( gamepad !== undefined && gamepad.pose !== null ) {


			//  Position and orientation.

			pose = gamepad.pose;
			scope.position.fromArray( pose.position );
			scope.quaternion.fromArray( pose.orientation );
			scope.matrix.compose( scope.position, scope.quaternion, scope.scale );
			scope.matrix.multiplyMatrices( scope.standingMatrix, scope.matrix );
			scope.matrixWorldNeedsUpdate = true;
			scope.visible = true;


			//  Thumbpad and Buttons.

			if ( axes[ 0 ] !== gamepad.axes[ 0 ] ||
				axes[ 1 ] !== gamepad.axes[ 1 ] ) {

				axes[ 0 ] = gamepad.axes[ 0 ];//  X axis: -1 = Left, +1 = Right.
				axes[ 1 ] = gamepad.axes[ 1 ];//  Y axis: -1 = Bottom, +1 = Top.
				dispatchViveControllerEvent( 'AxisChanged', { axes: axes } );

			}
			if ( thumbpadIsPressed !== gamepad.buttons[ 0 ].pressed ) {

				thumbpadIsPressed = gamepad.buttons[ 0 ].pressed;
				dispatchViveControllerEvent( thumbpadIsPressed ? 'ThumbpadPressed' : 'ThumbpadReleased' );

			}
			if ( triggerIsPressed !== gamepad.buttons[ 1 ].pressed ) {

				triggerIsPressed = gamepad.buttons[ 1 ].pressed;
				dispatchViveControllerEvent( triggerIsPressed ? 'TriggerPressed' : 'TriggerReleased' );

			}
			if ( gripsArePressed !== gamepad.buttons[ 2 ].pressed ) {

				gripsArePressed = gamepad.buttons[ 2 ].pressed;
				dispatchViveControllerEvent( gripsArePressed ? 'GripsPressed' : 'GripsReleased' );

			}
			if ( menuIsPressed !== gamepad.buttons[ 3 ].pressed ) {

				menuIsPressed = gamepad.buttons[ 3 ].pressed;
				dispatchViveControllerEvent( menuIsPressed ? 'MenuPressed' : 'MenuReleased' );

			}

		}
		else scope.visible = false;

	}

}
THREE.ViveController.prototype = Object.create( THREE.Object3D.prototype );
THREE.ViveController.prototype.constructor = THREE.ViveController;
