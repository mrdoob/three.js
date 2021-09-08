import { Cache } from './Cache.js';
import { Loader } from './Loader.js';

const loading = {};

class FileLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		const scope = this;

		const cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

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

		// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseType
		// if (this.responseType !== undefined) {
		//   request.responseType = this.responseType;
		// }

		// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
		// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included
		// if (this.withCredentials !== undefined) {
		//   request.withCredentials = this.withCredentials;
		// }

		// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/overrideMimeType
		// if (request.overrideMimeType) {
		//   request.overrideMimeType(
		//     this.mimeType !== undefined ? this.mimeType : "text/plain",
		//   );
		// }

		// TODO-DefinitelyMaybe: Confirm if Safari can handle Data URIs through fetch

		// create request
		const req = new Request( url, {
			method: 'GET',
			headers: new Headers( this.requestHeader ),
			// signal: this.signal ? this.signal : undefined, // An abort signal for those that use it
		} );

		// start the fetch
		fetch( req )
			.then( ( res ) => {

				// https://xhr.spec.whatwg.org/#the-response-attribute

				if ( res.status === 200 || res.status === 0 ) {

					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					if ( res.status === 0 ) {

						console.warn( 'THREE.FileLoader: HTTP Status 0 received.' );

					}

					switch ( this.responseType ) {

						case 'arraybuffer':
							// Add to cache only on HTTP success, so that we do not cache
							// error response bodies as proper responses to requests.
							res.arrayBuffer()
								.then( ab => {

									Cache.add( url, ab );

									const callbacks = loading[ url ];
									delete loading[ url ];

									for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

										const callback = callbacks[ i ];
										if ( callback.onLoad ) callback.onLoad( ab );

									}

									scope.manager.itemEnd( url );

								} );
							break;
						case 'blob':
							res.blob()
								.then( blob => {

									Cache.add( url, blob );

									const callbacks = loading[ url ];
									delete loading[ url ];

									for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

										const callback = callbacks[ i ];
										if ( callback.onLoad ) callback.onLoad( blob );

									}

									scope.manager.itemEnd( url );

								} );
							break;
						case 'document':
							res.text()
								.then( text => {

									const parser = new DOMParser();
									const dom = parser.parseFromString( text, this.mimeType );

									Cache.add( url, dom );

									const callbacks = loading[ url ];
									delete loading[ url ];

									for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

										const callback = callbacks[ i ];
										if ( callback.onLoad ) callback.onLoad( dom );

									}

									scope.manager.itemEnd( url );

								} );
							break;
						case 'json':
							res.json()
								.then( json => {

									Cache.add( url, json );

									const callbacks = loading[ url ];
									delete loading[ url ];

									for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

										const callback = callbacks[ i ];
										if ( callback.onLoad ) callback.onLoad( json );

									}

									scope.manager.itemEnd( url );

								} );
							break;
						default: // 'text' or other
							// TODO-DefinitelyMaybe: assuming text. Could've gone for `new File([Blob])`?
							res.text()
								.then( text => {

									Cache.add( url, text );

									const callbacks = loading[ url ];
									delete loading[ url ];

									for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

										const callback = callbacks[ i ];
										if ( callback.onLoad ) callback.onLoad( text );

									}

									scope.manager.itemEnd( url );

								} );
							break;

					}

				} else {

					const callbacks = loading[ url ];
					delete loading[ url ];

					for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

						const callback = callbacks[ i ];
						if ( callback.onError ) callback.onError( res.statusText );

					}

					scope.manager.itemError( url );
					scope.manager.itemEnd( url );

				}

			} )
			.catch( ( err ) => {

				// Abort errors and other errors are handled the same

				const callbacks = loading[ url ];
				delete loading[ url ];

				for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

					const callback = callbacks[ i ];
					if ( callback.onError ) callback.onError( err );

				}

				scope.manager.itemError( url );
				scope.manager.itemEnd( url );

			} );
		// Straight after the fetch is initiated we can call the "progress" events
		const callbacks = loading[ url ];

		for ( let i = 0, il = callbacks.length; i < il; i ++ ) {

			const callback = callbacks[ i ];
			if ( callback.onProgress ) callback.onProgress();

		}

		scope.manager.itemStart( url );

		return;

	}

	setResponseType( value ) {

		this.responseType = value;
		return this;

	}

	setMimeType( value ) {

		this.mimeType = value;
		return this;

	}

}


export { FileLoader };
