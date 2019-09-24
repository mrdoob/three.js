import { Path } from "../extras/core/Path.js";

Object.assign( Path.prototype, {

	fromPoints: function ( points ) {

		console.warn( 'THREE.Path: .fromPoints() has been renamed to .setFromPoints().' );
		this.setFromPoints( points );

	}

} );
