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
				version: 4.0,
				type: 'object',
				generator: 'ObjectExporter'
			}
		};

		//

		var geometries = {};
		var geometryExporter = new THREE.GeometryExporter();

		var parseGeometry = function ( geometry ) {

			if ( geometries[ geometry.id ] === undefined ) {

				if ( output.geometries === undefined ) {

					output.geometries = [];

				}

				geometries[ geometry.id ] = output.geometries.length;

				var data = {};

				if ( geometry.name !== "" ) data.name = geometry.name;
        if ( geometry.uuid !== "" ) data.uuid = geometry.uuid;

				if ( geometry instanceof THREE.PlaneGeometry ) {

					data.type = 'PlaneGeometry';
					data.width = geometry.width;
					data.height = geometry.height;
					data.widthSegments = geometry.widthSegments;
					data.heightSegments = geometry.heightSegments;

				} else if ( geometry instanceof THREE.CubeGeometry ) {

					data.type = 'CubeGeometry';
					data.width = geometry.width;
					data.height = geometry.height;
					data.depth = geometry.depth;
					data.widthSegments = geometry.widthSegments;
					data.heightSegments = geometry.heightSegments;
					data.depthSegments = geometry.depthSegments;

				} else if ( geometry instanceof THREE.CylinderGeometry ) {

					data.type = 'CylinderGeometry';
					data.radiusTop = geometry.radiusTop;
					data.radiusBottom = geometry.radiusBottom;
					data.height = geometry.height;
					data.radiusSegments = geometry.radiusSegments;
					data.heightSegments = geometry.heightSegments;
					data.openEnded = data.openEnded;

				} else if ( geometry instanceof THREE.SphereGeometry ) {

					data.type = 'SphereGeometry';
					data.radius = geometry.radius;
					data.widthSegments = geometry.widthSegments;
					data.heightSegments = geometry.heightSegments;
					data.phiStart = geometry.phiStart;
					data.phiLength = geometry.phiLength;
					data.thetaStart = geometry.thetaStart;
					data.thetaLength = geometry.thetaLength;

				} else if ( geometry instanceof THREE.IcosahedronGeometry ) {

					data.type = 'IcosahedronGeometry';
					data.radius = geometry.radius;
					data.detail = geometry.detail;

				} else if ( geometry instanceof THREE.TorusGeometry ) {

					data.type = 'TorusGeometry';
					data.radius = geometry.radius;
					data.tube = geometry.tube;
					data.radialSegments = geometry.radialSegments;
					data.tubularSegments = geometry.tubularSegments;
					data.arc = geometry.arc;

				} else if ( geometry instanceof THREE.TorusKnotGeometry ) {

					data.type = 'TorusKnotGeometry';
					data.radius = geometry.radius;
					data.tube = geometry.tube;
					data.radialSegments = geometry.radialSegments;
					data.tubularSegments = geometry.tubularSegments;
					data.p = geometry.p;
					data.q = geometry.q;
					data.heightScale = geometry.heightScale;

				} else if ( geometry instanceof THREE.Geometry ) {

					data.type = 'Geometry';
					data.data = geometryExporter.parse( geometry );

					delete data.data.metadata;

				}

				output.geometries.push( data );

			}

			return geometries[ geometry.id ];

		};

		//

		var materials = {};
		var materialExporter = new THREE.MaterialExporter();

		var parseMaterial = function ( material ) {

			if ( materials[ material.id ] === undefined ) {

				if ( output.materials === undefined ) {

					output.materials = [];

				}

				materials[ material.id ] = output.materials.length;

				var data = materialExporter.parse( material );

				delete data.metadata;

				output.materials.push( data );

			}

			return materials[ material.id ];

		};

		//

		var parseObject = function ( object ) {

			var data = {};

			if ( object.name !== '' ) data.name = object.name;
			if ( object.uuid !== '' ) data.uuid = object.uuid;
			if ( JSON.stringify( object.userData ) !== '{}' ) data.userData = object.userData;
			if ( object.visible !== true ) data.visible = object.visible;

			if ( object instanceof THREE.Scene ) {

				data.type = 'Scene';

			} else if ( object instanceof THREE.PerspectiveCamera ) {

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

			} else if ( object instanceof THREE.DirectionalLight ) {

				data.type = 'DirectionalLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.PointLight ) {

				data.type = 'PointLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.distance = object.distance;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.SpotLight ) {

				data.type = 'SpotLight';
				data.color = object.color.getHex();
				data.intensity = object.intensity;
				data.distance = object.distance;
				data.angle = object.angle;
				data.exponent = object.exponent;
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.HemisphereLight ) {

				data.type = 'HemisphereLight';
				data.color = object.color.getHex();
				data.groundColor = object.groundColor.getHex();
				data.position = object.position.toArray();

			} else if ( object instanceof THREE.Mesh ) {

				data.type = 'Mesh';
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();
				data.scale = object.scale.toArray();
				data.geometry = parseGeometry( object.geometry );
				data.material = parseMaterial( object.material );

			} else {

				data.type = 'Object3D';
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();
				data.scale = object.scale.toArray();

			}

			if ( object.children.length > 0 ) {

				data.children = [];

				for ( var i = 0; i < object.children.length; i ++ ) {

					data.children.push( parseObject( object.children[ i ] ) );

				}

			}

			return data;

		}

		output.object = parseObject( object );

		return output;

	}

}
