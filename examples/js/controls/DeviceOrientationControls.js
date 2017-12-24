/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 * @author MasterJames / http://master-domain.com
 * 
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */

THREE.DeviceOrientationControls = function( camera, autoConnect, deviceLandscapeAlphaOffset, stabilityChecks, scope ) {
	if( scope === undefined ) scope = this; // could be {} aka Object.create(null) and new becomes meaningless
								// maybe scope should probably just be set to camera though then the next line goes too
	scope.cam = camera;
	camera.rotation.reorder( "YXZ" );

	scope.enabled = true;

	scope.screenOrientation = window.orientation || 0;
	if( stabilityChecks !== undefined && stabilityChecks.constructor === Number ) scope.stabilityChecks = stabilityChecks;
	else scope.stabilityChecks = 7;
	scope.checksDone = 0;
	if( deviceLandscapeAlphaOffset !== undefined  && deviceLandscapeAlphaOffset.constructor === Number ) scope.deviceLandscapeAlphaOffset =  deviceLandscapeAlphaOffset;
	else {
		if( ( navigator.userAgent || "" ).indexOf( "Android 7" ) !== -1 ) scope.deviceLandscapeAlphaOffset = -0.1;
		else scope.deviceLandscapeAlphaOffset = 0;
	}

	let onDeviceChangeEvent = function( evt ) {
		let chkLimit = scope.stabilityChecks, chksDone = scope.checksDone;
		if( chksDone < ( chkLimit * 3 ) ) {
			if( chksDone > ( chkLimit * 2 ) || ( chksDone < chkLimit && ( evt.beta < 88 || evt.beta > 92 ) ) ) {
				scope.alphaOffset = ( THREE.Math.degToRad( evt.alpha + evt.gamma ) * -1 );
				let sOrt = Math.abs( scope.screenOrientation );
				if( sOrt === 90 || sOrt === 270 ) {
					if( scope.screenOrientation > 0 ) scope.alphaOffset += 0.1;
					else scope.alphaOffset += scope.deviceLandscapeAlphaOffset;
				}
			}
			scope.checksDone++;
		}
		scope.deviceOrientation = evt;
	};

	let onScreenChangeEvent = function() {
		scope.screenOrientation = window.orientation;
	};

	// The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''
	let setObjectQuaternion = ( function() {
		let zee = new THREE.Vector3( 0, 0, 1 );
		let euler = new THREE.Euler();
		let q0 = new THREE.Quaternion();
		let q1 = new THREE.Quaternion( (Math.sqrt( 0.5 ) * -1.0), 0, 0, Math.sqrt( 0.5 ) ); // - PI/2 around the x-axis

		return function( quaternion, alpha, beta, gamma, orient ) {
			euler.set( beta, alpha, ( gamma * -1.0 ), 'YXZ' ); // 'ZXY' for the device, but 'YXZ' for us
			quaternion.setFromEuler( euler ); // orient the device
			quaternion.multiply( q1 ); // camera looks out the back of the device, not the top
			quaternion.multiply( q0.setFromAxisAngle( zee, ( orient * -1.0 ) ) ); // adjust for screen orientation
		}
	}() );

	scope.connect = function() {
		onScreenChangeEvent(); // run once on load
		window.addEventListener( 'orientationchange', onScreenChangeEvent, false );
		window.addEventListener( 'deviceorientation', onDeviceChangeEvent, false );
		scope.enabled = true;
	};

	scope.dispose = scope.disconnect = function() {
		window.removeEventListener( 'orientationchange', onScreenChangeEvent, false );
		window.removeEventListener( 'deviceorientation', onDeviceChangeEvent, false );
		scope.enabled = false;
	};

	scope.update = function() {
		if ( scope.enabled === false ) return;
		let dOrt = scope.deviceOrientation;
		if( dOrt !== undefined ) {
			setObjectQuaternion( scope.cam.quaternion, ( THREE.Math.degToRad( dOrt.alpha ) + scope.alphaOffset ),
				THREE.Math.degToRad( dOrt.beta ), THREE.Math.degToRad( dOrt.gamma ), THREE.Math.degToRad( scope.screenOrientation ) );
		}
	};

	if( autoConnect !== false ) scope.connect();
};
