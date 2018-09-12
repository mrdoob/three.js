THREE.ReflectorRTT = function ( geometry, options ) {

	THREE.Reflector.call( this, geometry, options );

	this.type = 'ReflectorRTT';

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

THREE.ReflectorRTT.prototype = Object.create( THREE.Reflector.prototype );
