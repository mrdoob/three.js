/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.KMZLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.KMZLoader.prototype = {

	constructor: THREE.KMZLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		var zip = new JSZip( data );

		// console.log( zip );

		// var xml = new DOMParser().parseFromString( zip.file( 'doc.kml' ).asText(), 'application/xml' );

		function loadImage( image ) {

			var path = decodeURI( image.init_from );

			// Hack to support relative paths
			path = path.replace( '../', '' );

			var regex = new RegExp( path + '$' );
			var files = zip.file( regex );

			// console.log( image, files );

			if ( files.length ) {

				var file = files[ 0 ];
				var blob = new Blob( [ file.asArrayBuffer() ], { type: 'application/octet-binary' } );
				image.build.src = URL.createObjectURL( blob );

			}

		}

		// load collada

		var files = zip.file( /dae$/i );

		if ( files.length ) {

			var file = files[ 0 ];

			var collada = new THREE.ColladaLoader().parse( file.asText() );

			// fix images

			var images = collada.library.images;

			for ( var name in images ) {

				loadImage( images[ name ] );

			}

			return collada;

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );

		return {
			scene: new THREE.Group()
		};

	}

};
