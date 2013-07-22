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
			attributes: {}
		};

		for ( var key in geometry.attributes ) {

			var attribute = geometry.attributes[ key ];

			output.attributes[ key ] = {
				itemSize: attribute.itemSize,
				type: attribute.array.constructor.name,
				array: Array.apply( [], attribute.array )
			}

		}

		if ( geometry.offsets.length > 0 ) {

			output.offsets = JSON.parse( JSON.stringify( geometry.offsets ) );

		}

		return output;

	}

};
