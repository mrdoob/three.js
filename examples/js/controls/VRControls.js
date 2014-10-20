/**
 * @author dmarcos / https://github.com/dmarcos
 */

THREE.VRControls = function ( camera, done ) {

	this._camera = camera;
	this._vrState = {
		hmd : {
			orientation: new THREE.Quaternion()
		}
	};

	this._init = function () {
		var self = this;
		if ( !navigator.mozGetVRDevices && !navigator.getVRDevices ) {
			if ( done ) {
				done("Your browser is not VR Ready");
			}
			return;
		}
		if ( navigator.getVRDevices ) {
			navigator.getVRDevices().then( gotVRDevices );
		} else {
			navigator.mozGetVRDevices( gotVRDevices );
		}
		function gotVRDevices( devices ) {
			var vrInput;
			var error;
			for ( var i = 0; i < devices.length; ++i ) {
				if ( devices[i] instanceof PositionSensorVRDevice ) {
					vrInput = devices[i]
					self._vrInput = vrInput;
					break; // We keep the first we encounter
				}
			}
			if ( done ) {
				if ( !vrInput ) {
				 error = 'HMD not available';
				}
				done( error );
			}
		}
	};

	this._init();

	this.update = function() {
		var camera = this._camera;
		var quat;
		var vrState = this.getVRState();
		if ( !vrState ) {
			return;
		}
		// Applies head rotation from sensors data.
		if ( camera ) {
			camera.quaternion.copy( vrState.hmd.orientation );
		}
	};

	this.getVRState = function() {
		var vrInput = this._vrInput;
		var vrState = this._vrState;
		var orientation;
		if ( !vrInput ) {
			return null;
		}
		// If orientation is not available we return the identity quaternion (no rotation)
		orientation = vrInput.getState().orientation || { x: 0, y: 0, z:0, w:1 };
		vrState.hmd.orientation.set( orientation.x, orientation.y, orientation.z, orientation.w );
		return vrState;
	};

};