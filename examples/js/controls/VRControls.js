/**
 * @author dmarcos / https://github.com/dmarcos
 * @author mrdoob / http://mrdoob.com
 */

THREE.VRControls = function ( object, done ) {

	var vrInput;

	var onVRDevices = function ( devices ) {

		for ( var i = 0; i < devices.length; i ++ ) {

			var device = devices[ i ];

			if ( device instanceof PositionSensorVRDevice ) {

				vrInput = devices[ i ];
				return; // We keep the first we encounter

			}

		}

		if ( done !== undefined ) {

			done( 'HMD not available' );

		}

	};

	if ( navigator.getVRDevices !== undefined ) {

		navigator.getVRDevices().then( onVRDevices );

	} else if ( navigator.getVRDevices !== undefined ) {

		navigator.mozGetVRDevices( onVRDevices );

	} else if ( done !== undefined ) {

		done( 'Your browser is not VR Ready' );

	}

	this.update = function () {

		if ( vrInput === undefined ) return;

		var orientation = vrInput.getState().orientation;

		if ( orientation !== null ) {

			object.quaternion.set( orientation.x, orientation.y, orientation.z, orientation.w );

		}

	};

};
