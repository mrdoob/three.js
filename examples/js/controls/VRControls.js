/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, onError ) {

	var scope = this;

	var vrInputs = [];

	function gotVRDevices( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			var device = devices[ i ];

			if ( device instanceof PositionSensorVRDevice ) {

				vrInputs.push( devices[ i ] );

			}

		}

		if ( onError ) onError( 'HMD not available' );

	};

	if ( navigator.getVRDevices ) {

		navigator.getVRDevices().then( gotVRDevices );

	}

	// the Rift SDK returns the position in meters
	// this scale factor allows the user to define how meters
	// are converted to scene units.

	this.scale = 1;

	this.update = function () {

		for ( var i = 0; i < vrInputs.length; i++ ) {

			var vrInput = vrInputs[ i ];

			var state = vrInput.getState();

			if ( state.orientation !== null ) {

				object.quaternion.copy( state.orientation );

			}

			if ( state.position !== null ) {

				object.position.copy( state.position ).multiplyScalar( scope.scale );

			}

		}

	};

	this.resetSensor = function () {

		for ( var i = 0; i < vrInputs.length; i++ ) {

			var vrInput = vrInputs[ i ];

			if ( vrInput.resetSensor !== undefined ) {

				vrInput.resetSensor();

			} else if ( vrInput.zeroSensor !== undefined ) {

				vrInput.zeroSensor();

			}

		}

	};

	this.zeroSensor = function () {

		THREE.warn( 'THREE.VRControls: .zeroSensor() is now .resetSensor().' );
		this.resetSensor();

	};

};
