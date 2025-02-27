import { AudioContext } from '../audio/AudioContext.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';

/**
 * Class for loading audio buffers. Audios are internally
 * loaded via {@link FileLoader}.
 *
 * ```js
 * const audioListener = new THREE.AudioListener();
 * const ambientSound = new THREE.Audio( audioListener );
 *
 * const loader = new THREE.AudioLoader();
 * const audioBuffer = await loader.loadAsync( 'audio/ambient_ocean.ogg' );
 *
 * ambientSound.setBuffer( audioBuffer );
 * ambientSound.play();
 * ```
 *
 * @augments Loader
 */
class AudioLoader extends Loader {

	/**
	 * Constructs a new audio loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded audio buffer
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(AudioBuffer)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setResponseType( 'arraybuffer' );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				// Create a copy of the buffer. The `decodeAudioData` method
				// detaches the buffer when complete, preventing reuse.
				const bufferCopy = buffer.slice( 0 );

				const context = AudioContext.getContext();
				context.decodeAudioData( bufferCopy, function ( audioBuffer ) {

					onLoad( audioBuffer );

				} ).catch( handleError );

			} catch ( e ) {

				handleError( e );

			}

		}, onProgress, onError );

		function handleError( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			scope.manager.itemError( url );

		}

	}

}


export { AudioLoader };
