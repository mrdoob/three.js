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
		loader.setDecodeCallback( decode );
		loader.load( url, function ( audioBuffer ) {

			onLoad( audioBuffer );

		}, onProgress, onError );

	}

} );

function decode( buffer, onLoad ) {

	var context = AudioContext.getContext();

	context.decodeAudioData( buffer, onLoad );

}


export { AudioLoader };
