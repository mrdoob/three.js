import { FileLoader } from './FileLoader';
import { DefaultLoadingManager } from './LoadingManager';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function ImageLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( ImageLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );
		image.onload = function () {

			image.onload = null;

			URL.revokeObjectURL( image.src );

			if ( onLoad ) onLoad( image );

			scope.manager.itemEnd( url );

		};
		image.onerror = onError;

		if ( url.indexOf( 'data:' ) === 0 ) {

			image.src = url;

		} else {

			var loader = new FileLoader();
			loader.setPath( this.path );
			loader.setResponseType( undefined !== this.responseType ? this.responseType : 'blob' );
			loader.setWithCredentials( this.withCredentials );
			loader.load( url, function ( response ) {

				if (loader.responseType == 'blob') {
				
					image.src = URL.createObjectURL( response );
					
				} else if (loader.responseType == 'arraybuffer') {
				
					var bytes = new Uint8Array(response);
					var binary = '';
					var len = bytes.byteLength;
					var chunkSize = Math.min(len, 32768);
					for (var i = 0; i < len; i += chunkSize) {
						binary += String.fromCharCode.apply( null, bytes.subarray( i, i + chunkSize) );
					}
					var b64 = btoa(binary);
					var dataURL = "data:image/png;base64," + b64;
					image.src = dataURL;
					
				} else {
				
					console.error("Unsupported XHR response type '" + this.responseType + "' specified.");
					
				}

			}, onProgress, onError );

		}

		scope.manager.itemStart( url );

		return image;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setWithCredentials: function ( value ) {

		this.withCredentials = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	},
	
	setResponseType: function ( value ) {
		
		this.responseType = value;
		return this;
	}			

} );


export { ImageLoader };
