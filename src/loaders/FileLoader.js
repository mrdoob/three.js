/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Cache } from './Cache.js';
import { DefaultLoadingManager } from './LoadingManager.js';

function FileLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( FileLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		// Check for data: URI
		var dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;
		var dataUriRegexResult = url.match( dataUriRegex );

		// Safari can not handle Data URIs through XMLHttpRequest so process manually
		if ( dataUriRegexResult ) {

			var mimeType = dataUriRegexResult[ 1 ];
			var isBase64 = !! dataUriRegexResult[ 2 ];
			var data = dataUriRegexResult[ 3 ];

			data = window.decodeURIComponent( data );

			if ( isBase64 ) data = window.atob( data );

			try {

				var response;
				var responseType = ( this.responseType || '' ).toLowerCase();

				switch ( responseType ) {

					case 'arraybuffer':
					case 'blob':

						var view = new Uint8Array( data.length );

						for ( var i = 0; i < data.length; i ++ ) {

							view[ i ] = data.charCodeAt( i );

						}

						if ( responseType === 'blob' ) {

							response = new Blob( [ view.buffer ], { type: mimeType } );

						} else {

							response = view.buffer;

						}

						break;

					case 'document':

						var parser = new DOMParser();
						response = parser.parseFromString( data, mimeType );

						break;

					case 'json':

						response = JSON.parse( data );

						break;

					default: // 'text' or other

						response = data;

						break;

				}

				// Wait for next browser tick like standard XMLHttpRequest event dispatching does
				window.setTimeout( function () {

					if ( onLoad ) onLoad( response );

					scope.manager.itemEnd( url );

				}, 0 );

			} catch ( error ) {

				// Wait for next browser tick like standard XMLHttpRequest event dispatching does
				window.setTimeout( function () {

					if ( onError ) onError( error );

					scope.manager.itemEnd( url );
					scope.manager.itemError( url );

				}, 0 );

			}

		} else {

			return Cache.retrieve(url, function(_onLoad, _onProgress, _onError) {

				var request = new XMLHttpRequest();
				request.open('GET', url, true);

				request.addEventListener('load', function (event) {

					var response = event.target.response;

					if (this.status === 200) {

						_onLoad(response);

						scope.manager.itemEnd(url);

					} else if (this.status === 0) {

						// Some browsers return HTTP Status 0 when using non-http protocol
						// e.g. 'file://' or 'data://'. Handle as success.

						console.warn('THREE.FileLoader: HTTP Status 0 received.');

						_onLoad(response);

						scope.manager.itemEnd(url);

					} else {

						_onError(event);

						scope.manager.itemEnd(url);
						scope.manager.itemError(url);

					}

				}, false);


				request.addEventListener('progress', function (event) {

					_onProgress(event);

				}, false);


				request.addEventListener('error', function (event) {

					_onError(event);

					scope.manager.itemEnd(url);
					scope.manager.itemError(url);

				}, false);

				if (scope.responseType !== undefined) request.responseType = scope.responseType;
				if (scope.withCredentials !== undefined) request.withCredentials = scope.withCredentials;

				if (request.overrideMimeType) request.overrideMimeType(scope.mimeType !== undefined ? scope.mimeType : 'text/plain');

				for (var header in scope.requestHeader) {

					request.setRequestHeader(header, scope.requestHeader[header]);
				}

				request.send(null);
				scope.manager.itemStart( url );
			}, onLoad, onProgress, onError);
		}
	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},

	setResponseType: function ( value ) {

		this.responseType = value;
		return this;

	},

	setWithCredentials: function ( value ) {

		this.withCredentials = value;
		return this;

	},

	setMimeType: function ( value ) {

		this.mimeType = value;
		return this;

	},

	setRequestHeader: function ( value ) {

		this.requestHeader = value;
		return this;

	}

} );


export { FileLoader };
