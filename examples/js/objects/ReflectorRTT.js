THREE.ReflectorRTT = function ( geometry, options ) {

	THREE.Reflector.call( this, geometry, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

	this.renderOrder = -Infinity; // render RTT first

};

THREE.ReflectorRTT.prototype = Object.create( THREE.Reflector.prototype );
