( function () {

	class ReflectorRTT extends THREE.Reflector {

		constructor( geometry, options ) {

			super( geometry, options );
			this.geometry.setDrawRange( 0, 0 ); // avoid rendering geometry

		}

	}

	THREE.ReflectorRTT = ReflectorRTT;

} )();
