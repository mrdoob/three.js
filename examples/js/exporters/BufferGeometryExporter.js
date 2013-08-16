/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryExporter = function () {};

THREE.BufferGeometryExporter.prototype = {

	constructor: THREE.BufferGeometryExporter,

	parse: function ( geometry ) {

		var output = {
			metadata: {
				version: 4.0,
				type: 'BufferGeometry',
				generator: 'BufferGeometryExporter'
			},
			attributes: {
			}
		};

		var attributes = geometry.attributes;
		var offsets = geometry.offsets;
		var boundingSphere = geometry.boundingSphere;

		for ( var key in attributes ) {

			var attribute = attributes[ key ];

			output.attributes[ key ] = {
				itemSize: attribute.itemSize,
				type: attribute.array.constructor.name,
				array: Array.apply( [], attribute.array )
			}

		}

		if ( offsets.length > 0 ) {

			output.offsets = JSON.parse( JSON.stringify( offsets ) );

		}

		if ( boundingSphere !== null ) {

			output.boundingSphere = {
				center: boundingSphere.center.toArray(),
				radius: boundingSphere.radius
			}

		}

		return output;

	}

};
