import { Ray } from "../math/Ray.js";

Object.assign( Ray.prototype, {

	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Ray: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	isIntersectionPlane: function ( plane ) {

		console.warn( 'THREE.Ray: .isIntersectionPlane() has been renamed to .intersectsPlane().' );
		return this.intersectsPlane( plane );

	},
	isIntersectionSphere: function ( sphere ) {

		console.warn( 'THREE.Ray: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
		return this.intersectsSphere( sphere );

	}

} );
