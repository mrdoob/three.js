/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, callback ) {

	var scope = this;

	var vrInput;

	var onVRDevices = function ( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			var device = devices[ i ];

			if ( device instanceof PositionSensorVRDevice ) {

				vrInput = devices[ i ];
				return; // We keep the first we encounter

			}

		}

		if ( callback !== undefined ) {

			callback( 'HMD not available' );

		}

	};

	if ( navigator.getVRDevices !== undefined ) {

		navigator.getVRDevices().then( onVRDevices );

	} else if ( callback !== undefined ) {

		callback( 'Your browser is not VR Ready' );

	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.
	this.scale = 1;
	this.positionalTrackingMatrix = new THREE.Matrix4();

	object.matrixAutoUpdate = false;

	this.update = function () {

		if ( vrInput === undefined ) return;

		var state = vrInput.getState();

		if ( state.orientation !== null ) {

			object.quaternion.copy( state.orientation );

		}

		if ( state.position !== null ) {

			// It honors the camera position and it applies offset within the tracking volume
			scope.positionalTrackingMatrix.makeTranslation(
				state.position.x * scope.scale,
				state.position.y * scope.scale,
				state.position.z * scope.scale );

			object.updateMatrixWorld();
			object.matrix.multiply( scope.positionalTrackingMatrix );

		}

	};

	this.zeroSensor = function () {

		if ( vrInput === undefined ) return;

		vrInput.zeroSensor();

	};

};
