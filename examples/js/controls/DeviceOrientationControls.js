/**
 * @author richt / http://richt.me
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 */

THREE.DeviceOrientationControls = function ( object ) {

	this.object = object;

	this.degtorad = Math.PI / 180;
	this.freeze = true;

	this.orientationData = {};
	this.eulerRotationOrder = "ZXY";

	this.registerOrientationData = function( data ) {
		this.freeze = false;
		this.orientationData = data;
	};

	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}

		this.object.rotation.set(
			(this.orientationData['beta'] || 0) * this.degtorad,
			(this.orientationData['gamma'] || 0) * this.degtorad,
			(this.orientationData['alpha'] || 0) * this.degtorad,
			this.eulerRotationOrder
		);
	};

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};

	this.connect = function() {
		window.addEventListener('deviceorientation', bind(this, this.registerOrientationData), false);
	};

	this.disconnect = function() {
		window.removeEventListener('deviceorientation', bind(this, this.registerOrientationData), false);
		this.freeze = true;
	};
};
