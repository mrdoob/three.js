/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.Geometry2Exporter = function () {};

THREE.Geometry2Exporter.prototype = {

	constructor: THREE.Geometry2Exporter,

	parse: function ( geometry ) {

		var output = {
			metadata: {
				version: 4.0,
				type: 'Geometry2',
				generator: 'Geometry2Exporter'
			}
		};

		var attributes = [ 'vertices', 'normals', 'uvs' ];

		for ( var key in attributes ) {

			var attribute = attributes[ key ];
			
			var typedArray = geometry[ attribute ];
			var array = [];

			for ( var i = 0, l = typedArray.length; i < l; i ++ ) {

				array[ i ] = typedArray[ i ];

			}

			output[ attribute ] = array;

		}

		var boundingSphere = geometry.boundingSphere;

		if ( boundingSphere !== null ) {

			output.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			}

		}

		return output;

	}

};
