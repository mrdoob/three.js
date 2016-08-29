/**
 * @author mrdoob / http://mrdoob.com
 * @author stewdio / http://stewd.io
 */

THREE.ViveController = function( id ) {

	THREE.Object3D.call( this );

	var gamepad, scope = this;

	this.getGamepad = function() {

		return gamepad;

	}
	this.matrixAutoUpdate = false;
	this.standingMatrix = new THREE.Matrix4();
	this.axes = [ 0, 0 ];
	this.thumbpadIsPressed = false;
	this.triggerIsPressed = false;
	this.gripsArePressed = false;
	this.menuIsPressed = false;

	function dispatchViveControllerEvent( name, data ) {

		if ( data === undefined ) data = {};
		data.id = id;
		data.gamepad = gamepad;
		window.dispatchEvent( new CustomEvent( 'viveController' + name, { detail: data } ) );

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

			if ( scope.axes[ 0 ] !== gamepad.axes[ 0 ] ||
				scope.axes[ 1 ] !== gamepad.axes[ 1 ] ) {

				scope.axes[ 0 ] = gamepad.axes[ 0 ];//  X axis: -1 = Left, +1 = Right.
				scope.axes[ 1 ] = gamepad.axes[ 1 ];//  Y axis: -1 = Bottom, +1 = Top.
				dispatchViveControllerEvent( 'AxisChanged', scope.axes );

			}
			if ( scope.thumbpadIsPressed !== gamepad.buttons[ 0 ].pressed ) {

				scope.thumbpadIsPressed = gamepad.buttons[ 0 ].pressed;
				dispatchViveControllerEvent( scope.thumbpadIsPressed ? 'ThumbpadPressed' : 'ThumbpadReleased' );

			}
			if ( scope.triggerIsPressed !== gamepad.buttons[ 1 ].pressed ) {

				scope.triggerIsPressed = gamepad.buttons[ 1 ].pressed;
				dispatchViveControllerEvent( scope.triggerIsPressed ? 'TriggerPressed' : 'TriggerReleased' );

			}
			if ( scope.gripsArePressed !== gamepad.buttons[ 2 ].pressed ) {

				scope.gripsArePressed = gamepad.buttons[ 2 ].pressed;
				dispatchViveControllerEvent( scope.gripsArePressed ? 'GripsPressed' : 'GripsReleased' );

			}
			if ( scope.menuIsPressed !== gamepad.buttons[ 3 ].pressed ) {

				scope.menuIsPressed = gamepad.buttons[ 3 ].pressed;
				dispatchViveControllerEvent( scope.menuIsPressed ? 'MenuPressed' : 'MenuReleased' );

			}

		}
		else scope.visible = false;

	}

}
THREE.ViveController.prototype = Object.create( THREE.Object3D.prototype );
THREE.ViveController.prototype.constructor = THREE.ViveController;
