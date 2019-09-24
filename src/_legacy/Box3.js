import { Box3 } from "../math/Box3.js";

Object.assign( Box3.prototype, {

	center: function ( optionalTarget ) {

		console.warn( 'THREE.Box3: .center() has been renamed to .getCenter().' );
		return this.getCenter( optionalTarget );

	},
	empty: function () {

		console.warn( 'THREE.Box3: .empty() has been renamed to .isEmpty().' );
		return this.isEmpty();

	},
	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Box3: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	isIntersectionSphere: function ( sphere ) {

		console.warn( 'THREE.Box3: .isIntersectionSphere() has been renamed to .intersectsSphere().' );
		return this.intersectsSphere( sphere );

	},
	size: function ( optionalTarget ) {

		console.warn( 'THREE.Box3: .size() has been renamed to .getSize().' );
		return this.getSize( optionalTarget );

	}
} );
