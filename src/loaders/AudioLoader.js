import { AudioContext } from '../audio/AudioContext.js';
import { FileLoader } from './FileLoader.js';
import { DefaultLoadingManager } from './LoadingManager.js';

/**
 * @author Reece Aaron Lecrivain / http://reecenotes.com/
 */

function AudioLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( AudioLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.load( url, function ( buffer ) {

			var context = AudioContext.getContext();

			context.decodeAudioData( buffer, function ( audioBuffer ) {

				onLoad( audioBuffer );

			} );

		}, onProgress, onError );

	}

} );


export { AudioLoader };
