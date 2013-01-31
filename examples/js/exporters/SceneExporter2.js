/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneExporter2 = function () {};

THREE.SceneExporter2.prototype = {

	constructor: THREE.SceneExporter2,

	parse: function ( scene ) {

		var output = {
			metadata: {
				formatVersion : 4.0,
				type : "scene",
				generatedBy : "SceneExporter"
			}
		};

		console.log( scene );

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

			} else {

				data.type = 'Object3D';
				data.position = object.position.toArray();
				data.rotation = object.rotation.toArray();
				data.scale = object.scale.toArray();

			}

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

		return JSON.stringify( output, null, '\t' );

	}

}