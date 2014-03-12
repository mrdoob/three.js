/**
 * @author richt / http://richt.me
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 */

THREE.DeviceOrientationControls = function ( object ) {

	this.object = object;

	this.freeze = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	var degtorad = Math.PI / 180;

	var _objectRotationMatrix = new THREE.Matrix4();
	var _tmpRotationMatrix    = new THREE.Matrix4();

	this.onDeviceOrientationChangeEvent = function( rawEvtData ) {
		this.deviceOrientation = rawEvtData;
	};

	this.onScreenOrientationChangeEvent = function() {
		this.screenOrientation = window.orientation || 0;
	};

	this.setObjectRotationMatrixFromDeviceOrientation = function() {
		var x = this.deviceOrientation.beta  ? this.deviceOrientation.beta  * degtorad : 0; // beta
		var y = this.deviceOrientation.gamma ? this.deviceOrientation.gamma * degtorad : 0; // gamma
		var z = this.deviceOrientation.alpha ? this.deviceOrientation.alpha * degtorad : 0; // alpha

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

		_objectRotationMatrix.set(
			m11,    m12,    m13,    0,
			m21,    m22,    m23,    0,
			m31,    m32,    m33,    0,
			0,      0,      0,      1
		);

		return _objectRotationMatrix;
	};

	this.remapObjectRotationMatrixFromScreenOrientation = function() {
                _tmpRotationMatrix.copy( _objectRotationMatrix );

		switch( this.screenOrientation ) {
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

				_objectRotationMatrix.elements[0]  = - _tmpRotationMatrix.elements[4];
				_objectRotationMatrix.elements[4]  =   _tmpRotationMatrix.elements[0];
				_objectRotationMatrix.elements[8]  =   _tmpRotationMatrix.elements[8];

				_objectRotationMatrix.elements[1]  = - _tmpRotationMatrix.elements[5];
				_objectRotationMatrix.elements[5]  =   _tmpRotationMatrix.elements[1];
				_objectRotationMatrix.elements[9]  =   _tmpRotationMatrix.elements[9];

				_objectRotationMatrix.elements[2]  = - _tmpRotationMatrix.elements[6];
				_objectRotationMatrix.elements[6]  =   _tmpRotationMatrix.elements[2];
				_objectRotationMatrix.elements[10] =   _tmpRotationMatrix.elements[10];

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

				_objectRotationMatrix.elements[0]  = - _tmpRotationMatrix.elements[0];
				_objectRotationMatrix.elements[4]  = - _tmpRotationMatrix.elements[4];
				_objectRotationMatrix.elements[8]  =   _tmpRotationMatrix.elements[8];

				_objectRotationMatrix.elements[1]  = - _tmpRotationMatrix.elements[1];
				_objectRotationMatrix.elements[5]  = - _tmpRotationMatrix.elements[5];
				_objectRotationMatrix.elements[9]  =   _tmpRotationMatrix.elements[9];

				_objectRotationMatrix.elements[2]  = - _tmpRotationMatrix.elements[2];
				_objectRotationMatrix.elements[6]  = - _tmpRotationMatrix.elements[6];
				_objectRotationMatrix.elements[10] =   _tmpRotationMatrix.elements[10];

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

				_objectRotationMatrix.elements[0]  =   _tmpRotationMatrix.elements[4];
				_objectRotationMatrix.elements[4]  = - _tmpRotationMatrix.elements[0];
				_objectRotationMatrix.elements[8]  =   _tmpRotationMatrix.elements[8];

				_objectRotationMatrix.elements[1]  =   _tmpRotationMatrix.elements[5];
				_objectRotationMatrix.elements[5]  = - _tmpRotationMatrix.elements[1];
				_objectRotationMatrix.elements[9]  =   _tmpRotationMatrix.elements[9];

				_objectRotationMatrix.elements[2]  =   _tmpRotationMatrix.elements[6];
				_objectRotationMatrix.elements[6]  = - _tmpRotationMatrix.elements[2];
				_objectRotationMatrix.elements[10] =   _tmpRotationMatrix.elements[10];

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

		return _objectRotationMatrix;
	};

	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}

		this.setObjectRotationMatrixFromDeviceOrientation();

		this.remapObjectRotationMatrixFromScreenOrientation();

		this.object.quaternion.setFromRotationMatrix( _objectRotationMatrix );
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
