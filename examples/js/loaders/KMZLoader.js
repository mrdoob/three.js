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

			scope.parse( text ).then( onLoad ).catch( onError );

		}, onProgress, onError );

	},

	parse: function ( data ) {

		if ( typeof JSZip === 'undefined' ) {

			var error =  new Error( 'THREE.KMZLoader: jszip missing and file is compressed.' );

			if ( typeof Promise === 'undefined' ) {

				throw error;

			} else {

				return Promise.reject( error );

			}

		}

		// Use JSZip.external.Promise instead of global Promise for IE11.
		// Seems like JSZip.external.Promise === Promise is true on Promise support browser.
		var promise = JSZip.external.Promise;

		if ( THREE.ColladaLoader === undefined ) {

			return promise.reject( new Error( 'THREE.KMZLoader: THREE.ColladaLoader missing.' ) );

		}

		var zip = new JSZip(); // eslint-disable-line no-undef

		return zip.loadAsync( data ).then( function ( zip ) {

			// console.log( zip );

			// zip.file( 'doc.kml' ).async( 'text' ).then( function( text ) {
			//
			//	var xml = new DOMParser().parseFromString( text, 'application/xml' );
			//
			// } );

			// load collada

			var files = zip.file( /dae$/i );

			if ( files.length ) {

				var file = files[ 0 ];

				return file.async( 'text' );

			}

			return promise.reject( 'KMZLoader: Couldn\'t find .dae file.' );

		} ).then( function ( text ) {

			function loadImage( image ) {

				var path = decodeURI( image.init_from );

				// Hack to support relative paths
				path = path.replace( '../', '' );

				var regex = new RegExp( path + '$' );
				var files = zip.file( regex );

				// console.log( image, files );

				if ( files.length ) {

					var file = files[ 0 ];

					return file.async( 'arraybuffer' ).then( function ( buffer ) {

						var blob = new Blob( [ buffer ], { type: 'application/octet-binary' } );
						image.build.src = URL.createObjectURL( blob );

					} );

				}

				return promise.resolve();

			}

			var collada = new THREE.ColladaLoader().parse( text );

			// fix images

			var images = collada.library.images;
			var pendings = [];

			for ( var name in images ) {

				pendings.push( loadImage( images[ name ] ) );

			}

			return promise.all( pendings ).then( function () {

				return collada;

			} );

		} );

	}

};
