import { AudioContext } from '../audio/AudioContext.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';

function AudioLoader( manager ) {

	Loader.call( this, manager );

}

AudioLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: AudioLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setResponseModifier( decodeAudioData );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( audioBuffer ) {

			try {

				onLoad( audioBuffer );

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

} );

function decodeAudioData( response, callback ) {

	var context = AudioContext.getContext();

	context.decodeAudioData( response, function ( audioBuffer ) {

		callback( audioBuffer );

	} );

}


export { AudioLoader };
