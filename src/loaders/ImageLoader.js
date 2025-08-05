import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { createElementNS } from '../utils.js';

const _loading = new WeakMap();

/**
 * A loader for loading images. The class loads images with the HTML `Image` API.
 *
 * ```js
 * const loader = new THREE.ImageLoader();
 * const image = await loader.loadAsync( 'image.png' );
 * ```
 * Please note that `ImageLoader` has dropped support for progress
 * events in `r84`. For an `ImageLoader` that supports progress events, see
 * [this thread]{@link https://github.com/mrdoob/three.js/issues/10439#issuecomment-275785639}.
 *
 * @augments Loader
 */
class ImageLoader extends Loader {

	/**
	 * Constructs a new image loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded image
	 * to the `onLoad()` callback. The method also returns a new `Image` object which can
	 * directly be used for texture creation. If you do it this way, the texture
	 * may pop up in your scene once the respective loading process is finished.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Image)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Unsupported in this loader.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {Image} The image.
	 */
	load( url, onLoad, onProgress, onError ) {

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( `image:${url}` );

		if ( cached !== undefined ) {

			if ( cached.complete === true ) {

				scope.manager.itemStart( url );

				setTimeout( function () {

					if ( onLoad ) onLoad( cached );

					scope.manager.itemEnd( url );

				}, 0 );

			} else {

				let arr = _loading.get( cached );

				if ( arr === undefined ) {

					arr = [];
					_loading.set( cached, arr );

				}

				arr.push( { onLoad, onError } );

			}

			return cached;

		}

		const image = createElementNS( 'img' );

		function onImageLoad() {

			removeEventListeners();

			if ( onLoad ) onLoad( this );

			//

			const callbacks = _loading.get( this ) || [];

			for ( let i = 0; i < callbacks.length; i ++ ) {

				const callback = callbacks[ i ];
				if ( callback.onLoad ) callback.onLoad( this );

			}

			_loading.delete( this );

			scope.manager.itemEnd( url );

		}

		function onImageError( event ) {

			removeEventListeners();

			if ( onError ) onError( event );

			Cache.remove( `image:${url}` );

			//

			const callbacks = _loading.get( this ) || [];

			for ( let i = 0; i < callbacks.length; i ++ ) {

				const callback = callbacks[ i ];
				if ( callback.onError ) callback.onError( event );

			}

			_loading.delete( this );


			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		}

		function removeEventListeners() {

			image.removeEventListener( 'load', onImageLoad, false );
			image.removeEventListener( 'error', onImageError, false );

		}

		image.addEventListener( 'load', onImageLoad, false );
		image.addEventListener( 'error', onImageError, false );

		if ( url.slice( 0, 5 ) !== 'data:' ) {

			if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

		}

		Cache.add( `image:${url}`, image );
		scope.manager.itemStart( url );

		image.src = url;

		return image;

	}

}


export { ImageLoader };
