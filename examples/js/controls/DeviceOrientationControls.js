/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( object ) {

	let scope = this;

	scope.object = object;
	scope.object.rotation.reorder( "YXZ" );

	scope.enabled = true;

	scope.deviceOrientation = {};
	scope.screenOrientation = window.orientation || 0;

	if(scope.screenOrientation === 0 ) scope.alphaOffset =  -1.5708; // radians
	else{
		if(scope.screenOrientation === 90 ) scope.alphaOffset = 1.5708;
		else scope.alphaOffset = -1.5708;
	}

	let onDeviceOrientationChangeEvent = function( event ) {
		scope.deviceOrientation = event;
	};

	let onScreenOrientationChangeEvent = function() {
		scope.screenOrientation = window.orientation || 0;
	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

	let setObjectQuaternion = ( function() {
		let zee = new THREE.Vector3( 0, 0, 1 );
		let euler = new THREE.Euler();
		let q0 = new THREE.Quaternion();
		let q1 = new THREE.Quaternion( - Math.sqrt( 0.5 ), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {
			euler.set( beta, alpha, - gamma, 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
			quaternion.setFromEuler( euler ); // orient the device
			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top
			quaternion.multiply( q0.setFromAxisAngle( zee, - orient ) ); // adjust for screen orientation
		}

	}() );

	scope.connect = function() {
		onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = true;

	};

	scope.disconnect = function() {
		window.removeEventListener( 'orientationchange', onScreenOrientationChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceOrientationChangeEvent, false );

		scope.enabled = false;

	};

	scope.update = function() {
		if ( scope.enabled === false ) return;

		let alpha = scope.deviceOrientation.alpha ? THREE.Math.degToRad( scope.deviceOrientation.alpha ) + this.alphaOffset : 0; // Z
		let beta = scope.deviceOrientation.beta ? THREE.Math.degToRad( scope.deviceOrientation.beta ) : 0; // X'
		let gamma = scope.deviceOrientation.gamma ? THREE.Math.degToRad( scope.deviceOrientation.gamma ) : 0; // Y''
		let orient = scope.screenOrientation ? THREE.Math.degToRad( scope.screenOrientation ) : 0; // O

		setObjectQuaternion( scope.object.quaternion, alpha, beta, gamma, orient );

	};

	scope.dispose = function() {
		scope.disconnect();
	};

	scope.connect();
};
