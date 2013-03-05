/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneExporter2 = function () {};

THREE.SceneExporter2.prototype = {

	constructor: THREE.SceneExporter2,

	parse: function ( scene ) {

		var output = {
			metadata: {
				version: 4.0,
				type: 'scene',
				generator: 'SceneExporter'
			}
		};

		console.log( scene );

		//

		var geometries = {};
		var geometryExporter = new THREE.GeometryExporter();

		var parseGeometry = function ( geometry ) {

			if ( geometries[ geometry.id ] === undefined ) {

				if ( output.geometries === undefined ) {

					output.geometries = [];

				}

				geometries[ geometry.id ] = output.geometries.length;

				output.geometries.push( geometryExporter.parse( geometry ) );

			}

			return geometries[ geometry.id ];

		};
		
		/*
		var materials = {};
		var materialExporter = new THREE.MaterialExporter();

		var parseMaterial = function ( material ) {



		};
		*/

		var parseObject = function ( object ) {

			var data = { name: object.name };

			if ( object instanceof THREE.PerspectiveCamera ) {

				data.type = 'PerspectiveCamera';
				data.fov = object.fov;
				data.aspect = object.aspect;
				data.near = object.near;
				data.far = object.far;
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();

			} else if ( object instanceof THREE.OrthographicCamera ) {

				data.type = 'OrthographicCamera';
				data.left = object.left;
				data.right = object.right;
				data.top = object.top;
				data.bottom = object.bottom;
				data.near = object.near;
				data.far = object.far;
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();

			} else if ( object instanceof THREE.AmbientLight ) {

				data.type = 'AmbientLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;

			} else if ( object instanceof THREE.DirectionalLight ) {

				data.type = 'DirectionalLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.PointLight ) {

				data.type = 'PointLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.SpotLight ) {

				data.type = 'SpotLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.HemisphereLight ) {

				data.type = 'HemisphereLight';
				data.color = object.color.getHex();

			} else if ( object instanceof THREE.Mesh ) {

				data.type = 'Mesh';
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();
				data.scale = object.scale.toArray();
				data.geometry = parseGeometry( object.geometry );

			} else {

				data.type = 'Object3D';
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();
				data.scale = object.scale.toArray();

			}

			data.userData = object.userData;

			// parse children

			if ( object.children.length > 0 ) {

				data.children = [];

				for ( var i = 0; i < object.children.length; i ++ ) {

					data.children.push( parseObject( object.children[ i ] ) );

				}

			}

			return data;

		}

		output.scene = parseObject( scene ).children;

		return output;

	}

}
