import { Triangle } from "../math/Triangle.js";

Object.assign( Triangle, {

	barycoordFromPoint: function ( point, a, b, c, target ) {

		console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
		return Triangle.getBarycoord( point, a, b, c, target );

	},
	normal: function ( a, b, c, target ) {

		console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
		return Triangle.getNormal( a, b, c, target );

	}

} );

Object.assign( Triangle.prototype, {

	area: function () {

		console.warn( 'THREE.Triangle: .area() has been renamed to .getArea().' );
		return this.getArea();

	},
	barycoordFromPoint: function ( point, target ) {

		console.warn( 'THREE.Triangle: .barycoordFromPoint() has been renamed to .getBarycoord().' );
		return this.getBarycoord( point, target );

	},
	midpoint: function ( target ) {

		console.warn( 'THREE.Triangle: .midpoint() has been renamed to .getMidpoint().' );
		return this.getMidpoint( target );

	},
	normal: function ( target ) {

		console.warn( 'THREE.Triangle: .normal() has been renamed to .getNormal().' );
		return this.getNormal( target );

	},
	plane: function ( target ) {

		console.warn( 'THREE.Triangle: .plane() has been renamed to .getPlane().' );
		return this.getPlane( target );

	}

} );
