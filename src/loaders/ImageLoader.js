/**
 * @author mrdoob / http://mrdoob.com/
 */

import { IndexedCache } from './IndexedCache.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function ImageLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

	this.cache = new IndexedCache();

}

Object.assign( ImageLoader.prototype, {

	crossOrigin: 'anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		var scope = this;


		var loadData = function () {

			var image = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'img' );

			function convertData( img ) {

				var imgCanvas = document.createElement( "canvas" ),
					imgContext = imgCanvas.getContext( "2d" );

				// Make sure canvas is as big as the picture
				imgCanvas.width = img.width;
				imgCanvas.height = img.height;

				// Draw image into canvas element
				imgContext.drawImage( img, 0, 0, img.width, img.height );

				// Get canvas contents as a data URL
				return imgCanvas.toDataURL( "image/png" );

			}

			function onImageLoad() {

				image.removeEventListener( 'load', onImageLoad, false );
				image.removeEventListener( 'error', onImageError, false );

				scope.cache.add( url, convertData( this ) );

				if ( onLoad ) onLoad( this );

				scope.manager.itemEnd( url );

			}

			function onImageError( event ) {

				image.removeEventListener( 'load', onImageLoad, false );
				image.removeEventListener( 'error', onImageError, false );

				if ( onError ) onError( event );

				scope.manager.itemError( url );
				scope.manager.itemEnd( url );

			}

			image.addEventListener( 'load', onImageLoad, false );
			image.addEventListener( 'error', onImageError, false );

			if ( url.substr( 0, 5 ) !== 'data:' ) {

				if ( this.crossOrigin !== undefined ) image.crossOrigin = this.crossOrigin;

			}

			scope.manager.itemStart( url );

			image.src = url;

		}.bind( this );

		var cacheRequest = this.cache.get( url );

		if ( cacheRequest !== undefined ) {

			cacheRequest.onsuccess = function ( data ) {

				scope.manager.itemStart( url );

				var image = new Image();
				image.src = data;
				onLoad( image );
				scope.manager.itemEnd( url );

			};

			cacheRequest.onerror = function () {

				loadData();

			};

		} else {

			loadData();

		}

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;
		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

} );


export {
	ImageLoader
};
