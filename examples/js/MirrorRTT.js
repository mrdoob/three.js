THREE.MirrorRTT = function ( width, height, options ) {

	THREE.Mirror.call( this, width, height, options );

	this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

};

THREE.MirrorRTT.prototype = Object.create( THREE.Mirror.prototype );
