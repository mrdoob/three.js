/**
 * @author mrdoob / http://mrdoob.com/
 */

var Mesh = require( "../objects/Mesh" );

module.exports = {

	merge: function ( geometry1, geometry2, materialIndexOffset ) {

		console.warn( "GeometryUtils: .merge() has been moved to Geometry. Use geometry.merge( geometry2, matrix, materialIndexOffset ) instead." );

		var matrix;

		if ( geometry2 instanceof Mesh ) {

			if( geometry2.matrixAutoUpdate ) { geometry2.updateMatrix(); }

			matrix = geometry2.matrix;
			geometry2 = geometry2.geometry;

		}

		geometry1.merge( geometry2, matrix, materialIndexOffset );

	},

	center: function ( geometry ) {

		console.warn( "GeometryUtils: .center() has been moved to Geometry. Use geometry.center() instead." );
		return geometry.center();

	}

};
