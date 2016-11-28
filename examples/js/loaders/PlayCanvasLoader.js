/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.PlayCanvasLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.PlayCanvasLoader.prototype = {

	constructor: THREE.PlayCanvasLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json ) {

		function parseVertices( data ) {

			var attributes = {};

			for ( var name in data ) {

				var attribute = data[ name ];

				var type = attribute.type;
				var size = attribute.components;

				var array;

				if ( type === 'float32' ) array = new Float32Array( attribute.data );
				if ( array === undefined ) console.log( 'PlayCanvasLoader: TODO', type );

				attributes[ name ] = new THREE.BufferAttribute( array, size );

			}

			data._attributes = attributes;

		}

		function parseMeshes( data ) {

			var geometry = new THREE.BufferGeometry();

			geometry.setIndex( new THREE.Uint16BufferAttribute( data.indices, 1 ) );

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
			object.name = data.name;

			if ( data._geometries !== undefined ) {

				var material = new THREE.MeshPhongMaterial();

				for ( var i = 0; i < data._geometries.length; i ++ ) {

					var geometry = data._geometries[ i ];

					object.add( new THREE.Mesh( geometry, material ) );

				}

			}

			for ( var i = 0; i < data.rotation.length; i ++ ) {

				data.rotation[ i ] *= Math.PI / 180;

			}

			object.position.fromArray( data.position );
			object.rotation.fromArray( data.rotation );
			object.scale.fromArray( data.scale );

			data._object = object;

		}

		//

		console.log( json );

		var model = json.model;

		for ( var i = 0; i < model.vertices.length; i ++ ) {

			parseVertices( model.vertices[ i ] );

		}

		for ( var i = 0; i < model.meshes.length; i ++ ) {

			parseMeshes( model.meshes[ i ] );

		}

		for ( var i = 0; i < model.meshInstances.length; i ++ ) {

			parseMeshInstances( model.meshInstances[ i ] );

		}

		for ( var i = 0; i < model.nodes.length; i ++ ) {

			parseNodes( model.nodes[ i ] );

		}

		for ( var i = 0; i < model.parents.length; i ++ ) {

			var parent = model.parents[ i ];

			if ( parent === -1 ) continue;

			model.nodes[ parent ]._object.add( model.nodes[ i ]._object );


		}

		return model.nodes[ 0 ]._object;

	}

};
