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

		function parseGeometries( xml ) {

			xml = xml.getElementsByTagName("geometry");

			var objects = [];

			for ( var i = 0; i < xml.length; i ++ ) {

				objects.push( parseMesh( xml[ i ].getElementsByTagName( 'mesh' )[ 0 ] ) );

			}

			return objects;

		}

		function parseMesh( xml ) {

			var geometry = new THREE.BufferGeometry();

			var sources = xml.getElementsByTagName( 'source' );

			for ( var i = 0; i < sources.length; i ++ ) {

				var source = sources[ i ];
				var floats = source.getElementsByTagName( 'float_array' )[ 0 ].textContent.split( ' ' );

				var array = [];
				for ( var j = 0; j < floats.length; j ++ ) {
					array.push( floats[ j ] );
				}

				geometry.addAttribute( 'position', new THREE.Float32Attribute( array, 3 ) );

			}


			var triangles = xml.getElementsByTagName( 'triangles' );

			if ( triangles === null ) return mesh;

			for ( var i = 0; i < triangles.length; i ++ ) {

				var triangle = triangles[ i ];

				var indices = triangle.getElementsByTagName( 'p' )[ 0 ].textContent.split( ' ' );

				var array = [];
				for ( var j = 0; j < indices.length; j ++ ) {
					array.push( parseInt( indices[ j ] ) );
				}

				geometry.setIndex( new THREE.Uint16Attribute( array, 1 ) );

			}

			return geometry;

		}

		console.time( 'ColladaLoader2' );

		var xml = new DOMParser().parseFromString( text, 'text/xml' );

		var geometries = xml.getElementsByTagName( 'library_geometries' )[ 0 ];
		var materials = xml.getElementsByTagName( 'library_materials' )[ 0 ];
		var images = xml.getElementsByTagName( 'library_images' )[ 0 ];
		var effects = xml.getElementsByTagName( 'library_effects' )[ 0 ];

		//console.log( geometries, materials, images, effects );

		var scene = new THREE.Scene();

		var geometries = parseGeometries( geometries );

		for ( var i = 0; i < geometries.length; i ++ ) {

			scene.add( new THREE.Mesh( geometries[ i ] ) );

		}

		console.timeEnd( 'ColladaLoader2' );

		console.log( scene );

		return {
			animations: [],
			kinematics: { joints: [] },
			scene: scene
		};


	}

};
