/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ColladaLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ColladaLoader.prototype = {

	constructor: THREE.ColladaLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	options: {

		set convertUpAxis ( value ) {
			console.log( 'ColladaLoder2: TODO' );
		}

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( text ) {

		function parseFloats( text ) {

			var array = [];
			var parts = text.split( ' ' );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {
				array.push( parseFloat( parts[ i ] ) );
			}

			return array;

		}

		function parseInts( text ) {

			var array = [];
			var parts = text.split( ' ' );

			for ( var i = 0, l = parts.length; i < l; i ++ ) {
				array.push( parseInt( parts[ i ] ) );
			}

			return array;

		}

		function parseGeometries( xml ) {

			xml = xml.getElementsByTagName( 'geometry' );

			var geometries = [];

			for ( var i = 0; i < xml.length; i ++ ) {

				geometries.push( parseGeometry( xml[ i ].getElementsByTagName( 'mesh' )[ 0 ] ) );

			}

			return geometries;

		}

		function parseGeometry( xml ) {

			var geometry = new THREE.BufferGeometry();

			// sources

			var sources = {};
			var sourceNodes = xml.getElementsByTagName( 'source' );

			for ( var i = 0; i < sourceNodes.length; i ++ ) {

				var sourceNode = sourceNodes[ i ];
				var array = parseFloats( sourceNode.getElementsByTagName( 'float_array' )[ 0 ].textContent );
				sources[ sourceNode.getAttribute( 'id' ) ] = array;

			}

			// vertices

			var verticesNode = xml.getElementsByTagName( 'vertices' )[ 0 ];
			sources[ verticesNode.getAttribute( 'id' ) ] = sources[ verticesNode.getElementsByTagName( 'input' )[ 0 ].getAttribute( 'source' ).substring( 1 ) ];

			// triangles

			var triangleNodes = xml.getElementsByTagName( 'triangles' );

			if ( triangleNodes === null ) return geometry;

			for ( var i = 0; i < triangleNodes.length; i ++ ) {

				var triangleNode = triangleNodes[ i ];

				// indices

				var indices = parseInts( triangleNode.getElementsByTagName( 'p' )[ 0 ].textContent );

				// inputs

				var inputNodes = triangleNode.getElementsByTagName( 'input' );

				var maxOffset = 0;

				for ( var j = 0; j < inputNodes.length; j ++ ) {

					var inputNode = inputNodes[ j ];
					maxOffset = Math.max( maxOffset, parseInt( inputNode.getAttribute( 'offset' ) ) + 1 );

				}

				for ( var j = 0; j < inputNodes.length; j ++ ) {

					var inputNode = inputNodes[ j ];

					var source = sources[ inputNode.getAttribute( 'source' ).substring( 1 ) ];
					var offset = parseInt( inputNode.getAttribute( 'offset' ) );

					var array = [];

					for ( var k = offset; k < indices.length; k += maxOffset ) {

						var index = indices[ k ] * 3;
						array.push( source[ index + 0 ], source[ index + 1 ], source[ index + 2 ] );

					}

					switch ( inputNode.getAttribute( 'semantic' ) ) {

						case 'VERTEX':
							geometry.addAttribute( 'position', new THREE.Float32Attribute( array, 3 ) );
							break;

						case 'NORMAL':
							geometry.addAttribute( 'normal', new THREE.Float32Attribute( array, 3 ) );
							break;

					}

				}

			}

			return geometry;

		}

		console.time( 'ColladaLoader2' );

		var xml = new DOMParser().parseFromString( text, 'text/xml' );

		var geometries = xml.getElementsByTagName( 'library_geometries' )[ 0 ];
		// var materials = xml.getElementsByTagName( 'library_materials' )[ 0 ];
		// var images = xml.getElementsByTagName( 'library_images' )[ 0 ];
		// var effects = xml.getElementsByTagName( 'library_effects' )[ 0 ];

		var scene = new THREE.Scene();

		var geometries = parseGeometries( geometries );
		var material = new THREE.MeshPhongMaterial();

		for ( var i = 0; i < geometries.length; i ++ ) {

			scene.add( new THREE.Mesh( geometries[ i ], material ) );

		}

		console.timeEnd( 'ColladaLoader2' );

		return {
			animations: [],
			kinematics: { joints: [] },
			scene: scene
		};

	}

};
