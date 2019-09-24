import { CurvePath } from "../extras/core/CurvePath.js";
import { Geometry } from "../core/Geometry.js";
import { Vector3 } from "../math/Vector3.js";

Object.assign( CurvePath.prototype, {

	createPointsGeometry: function ( divisions ) {

		console.warn( 'THREE.CurvePath: .createPointsGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		// generate geometry from path points (for Line or Points objects)

		var pts = this.getPoints( divisions );
		return this.createGeometry( pts );

	},

	createSpacedPointsGeometry: function ( divisions ) {

		console.warn( 'THREE.CurvePath: .createSpacedPointsGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		// generate geometry from equidistant sampling along the path

		var pts = this.getSpacedPoints( divisions );
		return this.createGeometry( pts );

	},

	createGeometry: function ( points ) {

		console.warn( 'THREE.CurvePath: .createGeometry() has been removed. Use new THREE.Geometry().setFromPoints( points ) instead.' );

		var geometry = new Geometry();

		for ( var i = 0, l = points.length; i < l; i ++ ) {

			var point = points[ i ];
			geometry.vertices.push( new Vector3( point.x, point.y, point.z || 0 ) );

		}

		return geometry;

	}

} );
