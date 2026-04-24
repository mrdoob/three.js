import { AnimationClip } from '../animation/AnimationClip.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';
import { error } from '../utils.js';

/**
 * Class for loading animation clips in the JSON format. The files are internally
 * loaded via {@link FileLoader}.
 *
 * ```js
 * const loader = new THREE.AnimationLoader();
 * const animations = await loader.loadAsync( 'animations/animation.js' );
 * ```
 *
 * @augments Loader
 */
class AnimationLoader extends Loader {

	/**
	 * Constructs a new animation loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and pass the loaded animations as an array
	 * holding instances of {@link AnimationClip} to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Array<AnimationClip>)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given JSON object and returns an array of animation clips.
	 *
	 * @param {Object} json - The serialized animation clips.
	 * @return {Array<AnimationClip>} The parsed animation clips.
	 */
	parse( json ) {

		const animations = [];

		for ( let i = 0; i < json.length; i ++ ) {

			const clip = AnimationClip.parse( json[ i ] );

			animations.push( clip );

		}

		return animations;

	}

}


export { AnimationLoader };
