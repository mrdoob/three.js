console.warn( "THREE.KMZLoader: As part of the transition to ES6 Modules, the files in 'examples/js' were deprecated in May 2020 (r117) and will be deleted in December 2020 (r124). You can find more information about developing using ES6 Modules in https://threejs.org/docs/index.html#manual/en/introduction/Import-via-modules." );
/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.KMZLoader = function ( manager ) {

	THREE.Loader.call( this, manager );

};

THREE.KMZLoader.prototype = Object.assign( Object.create( THREE.Loader.prototype ), {

	constructor: THREE.KMZLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	parse: function ( data ) {

		function findFile( url ) {

			for ( var path in zip.files ) {

				if ( path.substr( - url.length ) === url ) {

					return zip.files[ path ];

				}

			}

		}

		var manager = new THREE.LoadingManager();
		manager.setURLModifier( function ( url ) {

			var image = findFile( url );

			if ( image ) {

				console.log( 'Loading', url );

				var blob = new Blob( [ image.asArrayBuffer() ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		var zip = new JSZip( data );

		if ( zip.files[ 'doc.kml' ] ) {

			var xml = new DOMParser().parseFromString( zip.files[ 'doc.kml' ].asText(), 'application/xml' );

			var model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				var loader = new THREE.ColladaLoader( manager );
				return loader.parse( zip.files[ model.textContent ].asText() );

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( var path in zip.files ) {

				var extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					var loader = new THREE.ColladaLoader( manager );
					return loader.parse( zip.files[ path ].asText() );

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new THREE.Group() };

	}

} );
