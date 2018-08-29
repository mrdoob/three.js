/**
 * @author mrdoob / http://mrdoob.com/
 */
import * as THREE from '../../../build/three.module.js';
import { ColladaLoader } from '../../modules/loaders/ColladaLoader.js';
var __KMZLoader;

__KMZLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

__KMZLoader.prototype = {

	constructor: __KMZLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

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

		var zip = new JSZip( data ); // eslint-disable-line no-undef

		if ( zip.files[ 'doc.kml' ] ) {

			var xml = new DOMParser().parseFromString( zip.files[ 'doc.kml' ].asText(), 'application/xml' );

			var model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				var loader = new ColladaLoader( manager );
				return loader.parse( zip.files[ model.textContent ].asText() );

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( var path in zip.files ) {

				var extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					var loader = new ColladaLoader( manager );
					return loader.parse( zip.files[ path ].asText() );

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new THREE.Group() };

	}

};

export { __KMZLoader as KMZLoader };
