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
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
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

			for ( var path in zip ) {

				if ( path.substr( - url.length ) === url ) {

					return zip[ path ];

				}

			}

		}

		var manager = new THREE.LoadingManager();
		manager.setURLModifier( function ( url ) {

			var image = findFile( url );

			if ( image ) {

				console.log( 'Loading', url );

				var blob = new Blob( [ image.buffer ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		var zip = fflate.unzipSync( new Uint8Array( data ) ); // eslint-disable-line no-undef

		if ( zip[ 'doc.kml' ] ) {

			var xml = new DOMParser().parseFromString( fflate.strFromU8( zip[ 'doc.kml' ] ), 'application/xml' ); // eslint-disable-line no-undef

			var model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				var loader = new THREE.ColladaLoader( manager );
				return loader.parse( fflate.strFromU8( zip[ model.textContent ] ) ); // eslint-disable-line no-undef

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( var path in zip ) {

				var extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					var loader = new THREE.ColladaLoader( manager );
					return loader.parse( fflate.strFromU8( zip[ path ] ) ); // eslint-disable-line no-undef

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new THREE.Group() };

	}

} );
