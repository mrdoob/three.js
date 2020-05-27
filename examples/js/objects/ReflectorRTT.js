console.warn( "THREE.ReflectorRTT: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * RTT version
 */

THREE.ReflectorRTT = function ( geometry, options ) {

	THREE.Reflector.call( this, geometry, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

THREE.ReflectorRTT.prototype = Object.create( THREE.Reflector.prototype );
