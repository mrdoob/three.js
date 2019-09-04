/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

THREE.PlayCanvasLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

};

THREE.PlayCanvasLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.PlayCanvasLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json ) {

		function parseVertices( data ) {

			var attributes = {};

			// create a buffer attribute for each array that contains vertex information

			for ( var name in data ) {

				var array = data[ name ];

				var type = array.type;
				var size = array.components;

				var attribute;

				switch ( type ) {

					case 'float32':
						attribute = new THREE.Float32BufferAttribute( array.data, size );
						break;

					case 'uint8':
						attribute = new THREE.Uint8BufferAttribute( array.data, size );
						break;

					case 'uint16':
						attribute = new THREE.Uint16BufferAttribute( array.data, size );
						break;

					default:
						console.log( 'THREE.PlayCanvasLoader: Array type "%s" not yet supported.', type );

				}

				attributes[ name ] = attribute;

			}

			data._attributes = attributes;

		}

		function parseMeshes( data ) {

			// create buffer geometry

			var geometry = new THREE.BufferGeometry();

			geometry.setIndex( data.indices );

			var attributes = model.vertices[ data.vertices ]._attributes;

			for ( var name in attributes ) {

				var attribute = attributes[ name ];

				if ( name === 'texCoord0' ) name = 'uv';

				geometry.addAttribute( name, attribute );

			}

			data._geometry = geometry;

		}

		function parseMeshInstances( data ) {

			var node = model.nodes[ data.node ];
			var mesh = model.meshes[ data.mesh ];

			if ( node._geometries === undefined ) {

				node._geometries = [];

			}

			node._geometries.push( mesh._geometry );

		}

		function parseNodes( data ) {

			var object = new THREE.Group();

			var geometries = data._geometries;

			if ( geometries !== undefined ) {

				var material = new THREE.MeshPhongMaterial();

				for ( var i = 0, l = geometries.length; i < l; i ++ ) {

					var geometry = geometries[ i ];

					object.add( new THREE.Mesh( geometry, material ) );

				}

			}

			for ( var i = 0, l = data.rotation.length; i < l; i ++ ) {

				data.rotation[ i ] *= Math.PI / 180;

			}

			//

			object.name = data.name;

			object.position.fromArray( data.position );
			object.quaternion.setFromEuler( new THREE.Euler().fromArray( data.rotation ) );
			object.scale.fromArray( data.scale );

			data._object = object;

		}

		//

		var model = json.model;

		for ( var i = 0, l = model.vertices.length; i < l; i ++ ) {

			parseVertices( model.vertices[ i ] );

		}

		for ( var i = 0, l = model.meshes.length; i < l; i ++ ) {

			parseMeshes( model.meshes[ i ] );

		}

		for ( var i = 0, l = model.meshInstances.length; i < l; i ++ ) {

			parseMeshInstances( model.meshInstances[ i ] );

		}

		for ( var i = 0, l = model.nodes.length; i < l; i ++ ) {

			parseNodes( model.nodes[ i ] );

		}

		// setup scene hierarchy

		for ( var i = 0, l = model.parents.length; i < l; i ++ ) {

			var parent = model.parents[ i ];

			if ( parent === - 1 ) continue;

			model.nodes[ parent ]._object.add( model.nodes[ i ]._object );


		}

		return model.nodes[ 0 ]._object;

	}

} );
