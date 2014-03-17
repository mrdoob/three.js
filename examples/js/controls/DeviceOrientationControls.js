/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function ( object ) {

	this.object = object;

	this.object.rotation.reorder( "YXZ" );

	this.freeze = true;

	this.deviceOrientation = {};

	this.screenOrientation = 0;

	this.onDeviceOrientationChangeEvent = function( rawEvtData ) {

		this.deviceOrientation = rawEvtData;

	};

	this.onScreenOrientationChangeEvent = function() {

		this.screenOrientation = window.orientation || 0;

	};

	this.update = function() {

		var alpha, beta, gamma;

		return function () {

			if ( this.freeze ) return;

			alpha  = this.deviceOrientation.gamma ? THREE.Math.degToRad( this.deviceOrientation.alpha ) : 0; // Z
			beta   = this.deviceOrientation.beta  ? THREE.Math.degToRad( this.deviceOrientation.beta  ) : 0; // X'
			gamma  = this.deviceOrientation.gamma ? THREE.Math.degToRad( this.deviceOrientation.gamma ) : 0; // Y''
			orient = this.screenOrientation       ? THREE.Math.degToRad( this.screenOrientation       ) : 0; // O

			setObjectQuaternion( this.object.quaternion, alpha, beta, gamma, orient );

		}

	}();

	function bind( scope, fn ) {

		return function () {

			fn.apply( scope, arguments );

		};

	};

	this.connect = function() {

		this.onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', bind( this, this.onScreenOrientationChangeEvent ), false );
		window.addEventListener( 'deviceorientation', bind( this, this.onDeviceOrientationChangeEvent ), false );

		this.freeze = false;

	};

	this.disconnect = function() {

		this.freeze = true;

		window.removeEventListener( 'orientationchange', bind( this, this.onScreenOrientationChangeEvent ), false );
		window.removeEventListener( 'deviceorientation', bind( this, this.onDeviceOrientationChangeEvent ), false );

	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	setObjectQuaternion = function () {

		var zee = new THREE.Vector3( 0, 0, 1 );

		var euler = new THREE.Euler();

		var q0 = new THREE.Quaternion();

		var q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function ( quaternion, alpha, beta, gamma, orient ) {

			euler.set( beta, alpha, - gamma, 'YXZ' );                       // 'ZXY' for the device, but 'YXZ' for us

			quaternion.setFromEuler( euler );                               // orient the device

			quaternion.multiply( q1 );                                      // camera looks out the back of the device, not the top

			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) );    // adjust for screen orientation

		}

	}();

};
