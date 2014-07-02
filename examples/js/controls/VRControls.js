/**
 * @author dmarcos / https://github.com/dmarcos
 */

THREE.VRControls = function ( camera, done ) {

	this._camera = camera;

	this._init = function () {
		var self = this;
		this._renderer = renderer;
		if ( !navigator.mozGetVRDevices ) {
			if ( done ) {
				done("Your browser is not VR Ready");
			}
			return;
		}
		navigator.mozGetVRDevices( gotVRDevices );
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
			quat = new THREE.Quaternion(
				vrState.hmd.rotation[0],
				vrState.hmd.rotation[1],
				vrState.hmd.rotation[2],
				vrState.hmd.rotation[3]
			);
			camera.setRotationFromQuaternion( quat );
		}
	};

	this.getVRState = function() {
		var vrInput = this._vrInput;
		var orientation;
		var vrState;
		if ( !vrInput ) {
			return null;
		}
		orientation	= vrInput.getState().orientation;
		vrState = {
			hmd : {
				rotation : [
					orientation.x,
					orientation.y,
					orientation.z,
					orientation.w
				]
			}
		};
		return vrState;
	};

};