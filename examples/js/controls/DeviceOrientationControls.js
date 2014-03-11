/**
 * @author richt / http://richt.me
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 */

THREE.DeviceOrientationControls = function ( object ) {

	this.object = object;

	this.degtorad = Math.PI / 180;
	this.freeze = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	this._rotationVector = new THREE.Vector3();
	this._rotationMatrix = new THREE.Matrix4();

	this.onDeviceOrientationChangeEvent = function( rawEvtData ) {
		this.deviceOrientation = rawEvtData;
	};

	this.onScreenOrientationChangeEvent = function() {
		this.screenOrientation = window.orientation || 0;
	};

	this.setRotationVectorFromDeviceOrientation = function( alpha, beta, gamma) {
		this._rotationVector.set(
			(beta || 0) * this.degtorad,  // x
			(gamma || 0) * this.degtorad, // y
			(alpha || 0) * this.degtorad  // z
		);

		return this._rotationVector;
	};

	this.setRotationMatrixFromRotationVector = function( rotationVector ) {
		var x = rotationVector.x || 0; // beta
		var y = rotationVector.y || 0; // gamma
		var z = rotationVector.z || 0; // alpha

		var cX = Math.cos(x);
		var cY = Math.cos(y);
		var cZ = Math.cos(z);
		var sX = Math.sin(x);
		var sY = Math.sin(y);
		var sZ = Math.sin(z);

		//
		// ZXY rotation matrix construction.
		//
		// (see: http://bit.ly/1fjIr6Y)
		//

		var m11 = cZ * cY - sZ * sX * sY;
		var m12 = - cX * sZ;
		var m13 = cY * sZ * sX + cZ * sY;

		var m21 = cY * sZ + cZ * sX * sY;
		var m22 = cZ * cX;
		var m23 = sZ * sY - cZ * cY * sX;

		var m31 = - cX * sY;
		var m32 = sX;
		var m33 = cX * cY;

		this._rotationMatrix.set(
			m11,    m12,    m13,    0,
			m21,    m22,    m23,    0,
			m31,    m32,    m33,    0,
			0,      0,      0,      1
		);

		return this._rotationMatrix;
	};

	this.remapRotationMatrixByScreenOrientation = function( screenOrientation, rotationMatrix ) {
		var transformedRotationMatrix = new THREE.Matrix4();
		transformedRotationMatrix.copy( rotationMatrix );

		switch( screenOrientation ) {
			case 90:
			case -270:
				//
				// 90 degrees counter-clockwise screen transformation matrix:
				//
				//      /  0 -1  0  0  \
				//      |  1  0  0  0  |
				//      |  0  0  1  0  |
				//      \  0  0  0  1  /
				//
				// (see: http://bit.ly/1itCOq2)
				//

				transformedRotationMatrix.elements[0] = -rotationMatrix.elements[4];
				transformedRotationMatrix.elements[4] = rotationMatrix.elements[0];
				transformedRotationMatrix.elements[8] = rotationMatrix.elements[8];

				transformedRotationMatrix.elements[1] = -rotationMatrix.elements[5];
				transformedRotationMatrix.elements[5] = rotationMatrix.elements[1];
				transformedRotationMatrix.elements[9] = rotationMatrix.elements[9];

				transformedRotationMatrix.elements[2] = -rotationMatrix.elements[6];
				transformedRotationMatrix.elements[6] = rotationMatrix.elements[2];
				transformedRotationMatrix.elements[10] = rotationMatrix.elements[10];

				break;
			case 180:
			case -180:
				//
				// 180 degrees counter-clockwise screen transformation matrix:
				//
				//      / -1  0  0  0  \
				//      |  0 -1  0  0  |
				//      |  0  0  1  0  |
				//      \  0  0  0  1  /
				//
				// (see: http://bit.ly/1dIrx0I)
				//

				transformedRotationMatrix.elements[0] = -rotationMatrix.elements[0];
				transformedRotationMatrix.elements[4] = -rotationMatrix.elements[4];
				transformedRotationMatrix.elements[8] = rotationMatrix.elements[8];

				transformedRotationMatrix.elements[1] = -rotationMatrix.elements[1];
				transformedRotationMatrix.elements[5] = -rotationMatrix.elements[5];
				transformedRotationMatrix.elements[9] = rotationMatrix.elements[9];

				transformedRotationMatrix.elements[2] = -rotationMatrix.elements[2];
				transformedRotationMatrix.elements[6] = -rotationMatrix.elements[6];
				transformedRotationMatrix.elements[10] = rotationMatrix.elements[10];

				break;
			case 270:
			case -90:
				//
				// 270 degrees counter-clockwise screen transformation matrix:
				//
				//      /  0  1  0  0  \
				//      | -1  0  0  0  |
				//      |  0  0  1  0  |
				//      \  0  0  0  1  /
				//
				// (see: http://bit.ly/1h73sQ0)
				//

				transformedRotationMatrix.elements[0] = rotationMatrix.elements[4];
				transformedRotationMatrix.elements[4] = -rotationMatrix.elements[0];
				transformedRotationMatrix.elements[8] = rotationMatrix.elements[8];

				transformedRotationMatrix.elements[1] = rotationMatrix.elements[5];
				transformedRotationMatrix.elements[5] = -rotationMatrix.elements[1];
				transformedRotationMatrix.elements[9] = rotationMatrix.elements[9];

				transformedRotationMatrix.elements[2] = rotationMatrix.elements[6];
				transformedRotationMatrix.elements[6] = -rotationMatrix.elements[2];
				transformedRotationMatrix.elements[10] = rotationMatrix.elements[10];

				break;
			default:
				//
				// 0 degrees screen transformation matrix:
				//
				//      /  1  0  0  0  \
				//      |  0  1  0  0  |
				//      |  0  0  1  0  |
				//      \  0  0  0  1  /
				//
				// This transformation is the same as the identity matrix so we need do nothing

				break;
		}

		this._rotationMatrix.copy( transformedRotationMatrix );

		return this._rotationMatrix;
	};

	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}

		this.setRotationVectorFromDeviceOrientation(
			this.deviceOrientation.alpha,
			this.deviceOrientation.beta,
			this.deviceOrientation.gamma
		);

		this.setRotationMatrixFromRotationVector( this._rotationVector );

		this.remapRotationMatrixByScreenOrientation( this.screenOrientation, this._rotationMatrix );

		this.object.quaternion.setFromRotationMatrix( this._rotationMatrix );

		this.object.updateProjectionMatrix();
	};

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

};
