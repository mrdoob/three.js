THREE.ReflectorRTT = function ( geometry, options ) {

	THREE.Reflector.call( this, geometry, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

THREE.ReflectorRTT.prototype = Object.create( THREE.Reflector.prototype );
THREE.ReflectorRTT.prototype.constructor = THREE.ReflectorRTT;
THREE.ReflectorRTT.prototype.isReflectorRTT = true;
