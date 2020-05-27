console.warn( "THREE.TypedGeometryExporter: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.TypedGeometryExporter = function () {};

THREE.TypedGeometryExporter.prototype = {

	constructor: THREE.TypedGeometryExporter,

	parse: function ( geometry ) {

		var output = {
			metadata: {
				version: 4.0,
				type: 'TypedGeometry',
				generator: 'TypedGeometryExporter'
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
			};

		}

		return output;

	}

};
