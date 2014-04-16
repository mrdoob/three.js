/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ObjectExporter = function () {};

THREE.ObjectExporter.prototype = {

	constructor: THREE.ObjectExporter,

	parse: function ( object ) {

		// console.log( object );

		var output = {
			metadata: {
				version: 4.3,
				type: 'Object',
				generator: 'ObjectExporter'
			}
		};

		//

		var geometries = {};

		var exporters = {
			geometryExporter: new THREE.GeometryExporter(),
			bufferGeometryExporter: new THREE.BufferGeometryExporter()
		};
		
		var parseGeometry = function ( geometry ) {

			if ( output.geometries === undefined ) {

				output.geometries = [];

			}

			if ( geometries[ geometry.uuid ] === undefined ) {

				var data = geometry.toJSON( exporters );

				geometries[ geometry.uuid ] = data;

				output.geometries.push( data );

			}

			return geometry.uuid;

		};

		//

		var materials = {};

		var parseMaterial = function ( material ) {

			if ( output.materials === undefined ) {

				output.materials = [];

			}

			if ( materials[ material.uuid ] === undefined ) {

				var data = material.toJSON();

				materials[ material.uuid ] = data;

				output.materials.push( data );

			}

			return material.uuid;

		};

		//

		exporters.parseMaterial = parseMaterial;
		exporters.parseGeometry = parseGeometry;

		output.object = object.toJSON( exporters );
		output.materials = materials;
		output.geometries = geometries;

		return output;

	}

}
