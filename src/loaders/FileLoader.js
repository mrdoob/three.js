/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Cache } from './Cache';
import { DefaultLoadingManager } from './LoadingManager';

function FileLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( FileLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		var cached = Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

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

					 	response = new ArrayBuffer( data.length );

						var view = new Uint8Array( response );

						for ( var i = 0; i < data.length; i ++ ) {

							view[ i ] = data.charCodeAt( i );

						}

						if ( responseType === 'blob' ) {

							response = new Blob( [ response ], { type: mimeType } );

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

				// Wait for next browser tick
				window.setTimeout( function () {

					if ( onLoad ) onLoad( response );

					scope.manager.itemEnd( url );

				}, 0 );

			} catch ( error ) {

				// Wait for next browser tick
				window.setTimeout( function () {

					if ( onError ) onError( error );

					scope.manager.itemEnd( url );
					scope.manager.itemError( url );

				}, 0 );

			}

		} else {

			var request = new XMLHttpRequest();
			request.open( 'GET', url, true );

			request.addEventListener( 'load', function ( event ) {

				var response = event.target.response;

				Cache.add( url, response );

				if ( this.status === 200 ) {

					if ( onLoad ) onLoad( response );

					scope.manager.itemEnd( url );

				} else if ( this.status === 0 ) {

					// Some browsers return HTTP Status 0 when using non-http protocol
					// e.g. 'file://' or 'data://'. Handle as success.

					console.warn( 'THREE.FileLoader: HTTP Status 0 received.' );

					if ( onLoad ) onLoad( response );

					scope.manager.itemEnd( url );

				} else {

					if ( onError ) onError( event );

					scope.manager.itemEnd( url );
					scope.manager.itemError( url );

				}

			}, false );

			if ( onProgress !== undefined ) {

				request.addEventListener( 'progress', function ( event ) {

					onProgress( event );

				}, false );

			}

			request.addEventListener( 'error', function ( event ) {

				if ( onError ) onError( event );

				scope.manager.itemEnd( url );
				scope.manager.itemError( url );

			}, false );

			if ( this.responseType !== undefined ) request.responseType = this.responseType;
			if ( this.withCredentials !== undefined ) request.withCredentials = this.withCredentials;

			if ( request.overrideMimeType ) request.overrideMimeType( this.mimeType !== undefined ? this.mimeType : 'text/plain' );

			for ( var header in this.requestHeader ) {

				request.setRequestHeader( header, this.requestHeader[ header ] );

			}

			request.send( null );

		}

		scope.manager.itemStart( url );

		return request;

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
