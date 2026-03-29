import { Cache } from './Cache.js';
import { Loader } from './Loader.js';
import { warn } from '../utils.js';

const _errorMap = new WeakMap();

/**
 * A loader for loading images as an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/ImageBitmap).
 * An `ImageBitmap` provides an asynchronous and resource efficient pathway to prepare
 * textures for rendering.
 *
 * Note that {@link Texture#flipY} and {@link Texture#premultiplyAlpha} are ignored with image bitmaps.
 * These options need to be configured via {@link ImageBitmapLoader#setOptions} prior to loading,
 * unlike regular images which can be configured on the Texture to set these options on GPU upload instead.
 *
 * To match the default behaviour of {@link Texture}, the following options are needed:
 *
 * ```js
 * { imageOrientation: 'flipY', premultiplyAlpha: 'none' }
 * ```
 *
 * Also note that unlike {@link FileLoader}, this loader will only avoid multiple concurrent requests to the same URL if {@link Cache} is enabled.
 *
 * ```js
 * const loader = new THREE.ImageBitmapLoader();
 * loader.setOptions( { imageOrientation: 'flipY' } ); // set options if needed
 * const imageBitmap = await loader.loadAsync( 'image.png' );
 *
 * const texture = new THREE.Texture( imageBitmap );
 * texture.needsUpdate = true;
 * ```
 *
 * @augments Loader
 */
class ImageBitmapLoader extends Loader {

	/**
	 * Constructs a new image bitmap loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * This flag can be used for type testing.
		 *
		 * @type {boolean}
		 * @readonly
		 * @default true
		 */
		this.isImageBitmapLoader = true;

		if ( typeof createImageBitmap === 'undefined' ) {

			warn( 'ImageBitmapLoader: createImageBitmap() not supported.' );

		}

		if ( typeof fetch === 'undefined' ) {

			warn( 'ImageBitmapLoader: fetch() not supported.' );

		}

		/**
		 * Represents the loader options.
		 *
		 * @type {Object}
		 * @default {premultiplyAlpha:'none'}
		 */
		this.options = { premultiplyAlpha: 'none' };

		/**
		 * Used for aborting requests.
		 *
		 * @private
		 * @type {AbortController}
		 */
		this._abortController = new AbortController();

	}

	/**
	 * Sets the given loader options. The structure of the object must match the `options` parameter of
	 * [createImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/Window/createImageBitmap).
	 *
	 * @param {Object} options - The loader options to set.
	 * @return {ImageBitmapLoader} A reference to this image bitmap loader.
	 */
	setOptions( options ) {

		this.options = options;

		return this;

	}

	/**
	 * Starts loading from the given URL and pass the loaded image bitmap to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(ImageBitmap)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Unsupported in this loader.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @return {ImageBitmap|undefined} The image bitmap.
	 */
	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( `image-bitmap:${url}` );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			// If cached is a promise, wait for it to resolve
			if ( cached.then ) {

				cached.then( imageBitmap => {

					// check if there is an error for the cached promise

					if ( _errorMap.has( cached ) === true ) {

						if ( onError ) onError( _errorMap.get( cached ) );

						scope.manager.itemError( url );
						scope.manager.itemEnd( url );

					} else {

						if ( onLoad ) onLoad( imageBitmap );

						scope.manager.itemEnd( url );

						return imageBitmap;

					}

				} );

				return;

			}

			// If cached is not a promise (i.e., it's already an imageBitmap)
			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		const fetchOptions = {};
		fetchOptions.credentials = ( this.crossOrigin === 'anonymous' ) ? 'same-origin' : 'include';
		fetchOptions.headers = this.requestHeader;
		fetchOptions.signal = ( typeof AbortSignal.any === 'function' ) ? AbortSignal.any( [ this._abortController.signal, this.manager.abortController.signal ] ) : this._abortController.signal;

		const promise = fetch( url, fetchOptions ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			return createImageBitmap( blob, Object.assign( scope.options, { colorSpaceConversion: 'none' } ) );

		} ).then( function ( imageBitmap ) {

			Cache.add( `image-bitmap:${url}`, imageBitmap );

			if ( onLoad ) onLoad( imageBitmap );

			scope.manager.itemEnd( url );

			return imageBitmap;

		} ).catch( function ( e ) {

			if ( onError ) onError( e );

			_errorMap.set( promise, e );

			Cache.remove( `image-bitmap:${url}` );

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		} );

		Cache.add( `image-bitmap:${url}`, promise );
		scope.manager.itemStart( url );

	}

	/**
	 * Aborts ongoing fetch requests.
	 *
	 * @return {ImageBitmapLoader} A reference to this instance.
	 */
	abort() {

		this._abortController.abort();
		this._abortController = new AbortController();

		return this;

	}

}

export { ImageBitmapLoader };
