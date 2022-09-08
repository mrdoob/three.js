import {
	FileLoader,
	Group,
	Loader,
	LoadingManager
} from 'three';
import { ColladaLoader } from '../loaders/ColladaLoader.js';
import * as fflate from '../libs/fflate.module.js';

class KMZLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
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

	}

	parse( data ) {

		function findFile( url ) {

			for ( const path in zip ) {

				if ( path.slice( - url.length ) === url ) {

					return zip[ path ];

				}

			}

		}

		const manager = new LoadingManager();
		manager.setURLModifier( function ( url ) {

			const image = findFile( url );

			if ( image ) {

				console.log( 'Loading', url );

				const blob = new Blob( [ image.buffer ], { type: 'application/octet-stream' } );
				return URL.createObjectURL( blob );

			}

			return url;

		} );

		//

		const zip = fflate.unzipSync( new Uint8Array( data ) ); // eslint-disable-line no-undef

		if ( zip[ 'doc.kml' ] ) {

			const xml = new DOMParser().parseFromString( fflate.strFromU8( zip[ 'doc.kml' ] ), 'application/xml' ); // eslint-disable-line no-undef

			const model = xml.querySelector( 'Placemark Model Link href' );

			if ( model ) {

				const loader = new ColladaLoader( manager );
				return loader.parse( fflate.strFromU8( zip[ model.textContent ] ) ); // eslint-disable-line no-undef

			}

		} else {

			console.warn( 'KMZLoader: Missing doc.kml file.' );

			for ( const path in zip ) {

				const extension = path.split( '.' ).pop().toLowerCase();

				if ( extension === 'dae' ) {

					const loader = new ColladaLoader( manager );
					return loader.parse( fflate.strFromU8( zip[ path ] ) ); // eslint-disable-line no-undef

				}

			}

		}

		console.error( 'KMZLoader: Couldn\'t find .dae file.' );
		return { scene: new Group() };

	}

}

export { KMZLoader };
