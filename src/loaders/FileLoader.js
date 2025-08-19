import { Cache } from './Cache.js';
import { Loader } from './Loader.js';

const loading = {};

class HttpError extends Error {

	constructor( message, response ) {

		super( message );
		this.response = response;

	}

}

/**
 * A low level class for loading resources with the Fetch API, used internally by
 * most loaders. It can also be used directly to load any file type that does
 * not have a loader.
 *
 * This loader supports caching. If you want to use it, add `THREE.Cache.enabled = true;`
 * once to your application.
 *
 * ```js
 * const loader = new THREE.FileLoader();
 * const data = await loader.loadAsync( 'example.txt' );
 * ```
 *
 * @augments Loader
 */
class FileLoader extends Loader {

	/**
	 * Constructs a new file loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * The expected mime type. Valid values can be found
		 * [here]{@link hhttps://developer.mozilla.org/en-US/docs/Web/API/DOMParser/parseFromString#mimetype}
		 *
		 * @type {string}
		 */
		this.mimeType = '';

		/**
		 * The expected response type.
		 *
		 * @type {('arraybuffer'|'blob'|'document'|'json'|'')}
		 * @default ''
		 */
		this.responseType = '';

		/**
		 * Used for aborting requests.
		 *
		 * @private
		 * @type {AbortController}
		 */
		this._abortController = new AbortController();

	}

	/**
	 * Starts loading from the given URL and pass the loaded response to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(any)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} [onProgress] - Executed while the loading is in progress.
	 * @param {onErrorCallback} [onError] - Executed when errors occur.
	 * @return {any|undefined} The cached resource if available.
	 */
	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const cached = Cache.get( `file:${url}` );

		if ( cached !== undefined ) {

			this.manager.itemStart( url );

			setTimeout( () => {

				if ( onLoad ) onLoad( cached );

				this.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		// Check if request is duplicate

		if ( loading[ url ] !== undefined ) {

			loading[ url ].push( {

				onLoad: onLoad,
				onProgress: onProgress,
				onError: onError

			} );

			return;

		}

		// Initialise array for duplicate requests
		loading[ url ] = [];

		loading[ url ].push( {
			onLoad: onLoad,
			onProgress: onProgress,
			onError: onError,
		} );

		// create request
		const req = new Request( url, {
			headers: new Headers( this.requestHeader ),
			credentials: this.withCredentials ? 'include' : 'same-origin',
			signal: ( typeof AbortSignal.any === 'function' ) ? AbortSignal.any( [ this._abortController.signal, this.manager.abortController.signal ] ) : this._abortController.signal
		} );

		// record states ( avoid data race )
		const mimeType = this.mimeType;
		const responseType = this.responseType;

		// start the fetch
		fetch( req )
			.then( response => {

				if ( response.status === 200 || response.status === 0 ) {

					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if ( response.status === 0 ) {

						console.warn( 'THREE.FileLoader: HTTP Status 0 received.' );

					}

					// Workaround: Checking if response.body === undefined for Alipay browser #23548

					if ( typeof ReadableStream === 'undefined' || response.body === undefined || response.body.getReader === undefined ) {

						return response;

					}

					const callbacks = loading[ url ];
					const reader = response.body.getReader();

					// Nginx needs X-File-Size check
					// https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
					const contentLength = response.headers.get( 'X-File-Size' ) || response.headers.get( 'Content-Length' );
					const total = contentLength ? parseInt( contentLength ) : 0;
					const lengthComputable = total !== 0;
					let loaded = 0;

					// periodically read data into the new stream tracking while download progress
					const stream = new ReadableStream( {
						start( controller ) {

							readData();

							function readData() {

								reader.read().then( ( { done, value } ) => {

									if ( done ) {

										controller.close();

									} else {

										loaded += value.byteLength;

										const event = new ProgressEvent( 'progress', { lengthComputable, loaded, total } );
										for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

											const callback = callbacks[ i ];
											if ( callback.onProgress ) callback.onProgress( event );

										}

										controller.enqueue( value );
										readData();

									}

								}, ( e ) => {

									controller.error( e );

								} );

							}

						}

					} );

					return new Response( stream );

				} else {

					throw new HttpError( `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`, response );

				}

			} )
			.then( response => {

				switch ( responseType ) {

					case 'arraybuffer':

						return response.arrayBuffer();

					case 'blob':

						return response.blob();

					case 'document':

						return response.text()
							.then( text => {

								const parser = new DOMParser();
								return parser.parseFromString( text, mimeType );

							} );

					case 'json':

						return response.json();

					default:

						if ( mimeType === '' ) {

							return response.text();

						} else {

							// sniff encoding
							const re = /charset="?([^;"\s]*)"?/i;
							const exec = re.exec( mimeType );
							const label = exec && exec[ 1 ] ? exec[ 1 ].toLowerCase() : undefined;
							const decoder = new TextDecoder( label );
							return response.arrayBuffer().then( ab => decoder.decode( ab ) );

						}

				}

			} )
			.then( data => {

				// Add to cache only on HTTP success, so that we do not cache
				// error response bodies as proper responses to requests.
				Cache.add( `file:${url}`, data );

				const callbacks = loading[ url ];
				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onLoad ) callback.onLoad( data );

				}

			} )
			.catch( err => {

				// Abort errors and other errors are handled the same

				const callbacks = loading[ url ];

				if ( callbacks === undefined ) {

					// When onLoad was called and url was deleted in `loading`
					this.manager.itemError( url );
					throw err;

				}

				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onError ) callback.onError( err );

				}

				this.manager.itemError( url );

			} )
			.finally( () => {

				this.manager.itemEnd( url );

			} );

		this.manager.itemStart( url );

	}

	/**
	 * Sets the expected response type.
	 *
	 * @param {('arraybuffer'|'blob'|'document'|'json'|'')} value - The response type.
	 * @return {FileLoader} A reference to this file loader.
	 */
	setResponseType( value ) {

		this.responseType = value;
		return this;

	}

	/**
	 * Sets the expected mime type of the loaded file.
	 *
	 * @param {string} value - The mime type.
	 * @return {FileLoader} A reference to this file loader.
	 */
	setMimeType( value ) {

		this.mimeType = value;
		return this;

	}

	/**
	 * Aborts ongoing fetch requests.
	 *
	 * @return {FileLoader} A reference to this instance.
	 */
	abort() {

		this._abortController.abort();
		this._abortController = new AbortController();

		return this;

	}

}


export { FileLoader };
