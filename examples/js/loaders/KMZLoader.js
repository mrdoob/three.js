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

		var manager = new THREE.LoadingManager();
		manager.setURLModifier( function ( url ) {

			var image;

			zip.filter( function ( path, file ) {

				if ( path.substr( - url.length ) === url ) {

					image = file;

				}

			} );

			if ( image ) {

				console.log( 'Loading', url );

				var blob = new Blob( [ image.asArrayBuffer() ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		var collada;

		var zip = new JSZip( data ); // eslint-disable-line no-undef

		zip.filter( function ( path, file ) {

			var extension = file.name.split( '.' ).pop().toLowerCase();

			switch ( extension ) {

				/*
				case 'kml':

					var xml = new DOMParser().parseFromString( file.asText(), 'application/xml' );

					break;
				*/

				case 'dae':

					var loader = new THREE.ColladaLoader( manager );
					collada = loader.parse( file.asText() );

					break;

			}

		} );

		if ( collada ) {

			return collada;

		} else {

			console.error( 'KMZLoader: Couldn\'t find .dae file.' );
			return { scene: new THREE.Group() };

		}

	}

};
