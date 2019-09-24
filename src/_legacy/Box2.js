import { Box2 } from "../math/Box2.js";

Object.assign( Box2.prototype, {

	center: function ( optionalTarget ) {

		console.warn( 'THREE.Box2: .center() has been renamed to .getCenter().' );
		return this.getCenter( optionalTarget );

	},
	empty: function () {

		console.warn( 'THREE.Box2: .empty() has been renamed to .isEmpty().' );
		return this.isEmpty();

	},
	isIntersectionBox: function ( box ) {

		console.warn( 'THREE.Box2: .isIntersectionBox() has been renamed to .intersectsBox().' );
		return this.intersectsBox( box );

	},
	size: function ( optionalTarget ) {

		console.warn( 'THREE.Box2: .size() has been renamed to .getSize().' );
		return this.getSize( optionalTarget );

	}
} );
