import { Shape } from "../extras/core/Shape.js";
import { ExtrudeGeometry } from "../geometries/ExtrudeGeometry.js";
import { ShapeGeometry } from "../geometries/ShapeGeometry.js";

Object.assign( Shape.prototype, {

	extractAllPoints: function ( divisions ) {

		console.warn( 'THREE.Shape: .extractAllPoints() has been removed. Use .extractPoints() instead.' );
		return this.extractPoints( divisions );

	},
	extrude: function ( options ) {

		console.warn( 'THREE.Shape: .extrude() has been removed. Use ExtrudeGeometry() instead.' );
		return new ExtrudeGeometry( this, options );

	},
	makeGeometry: function ( options ) {

		console.warn( 'THREE.Shape: .makeGeometry() has been removed. Use ShapeGeometry() instead.' );
		return new ShapeGeometry( this, options );

	}

} );
