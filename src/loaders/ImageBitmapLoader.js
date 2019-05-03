/**
 * @author thespite / http://clicktorelease.com/
 */

import { IndexedCache } from './IndexedCache.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function ImageBitmapLoader( manager ) {

	if ( typeof createImageBitmap === 'undefined' ) {

		console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() not supported.' );

	}

	if ( typeof fetch === 'undefined' ) {

		console.warn( 'THREE.ImageBitmapLoader: fetch() not supported.' );

	}

	this.manager = manager !== undefined ? manager : DefaultLoadingManager;
	this.options = undefined;
	this.cache = new IndexedCache();


}

ImageBitmapLoader.prototype = {

	constructor: ImageBitmapLoader,

	setOptions: function setOptions( options ) {

		this.options = options;

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

		var scope = this;


		var loadData = function () {

			fetch( url ).then( function ( res ) {

				return res.blob();

			} ).then( function ( blob ) {

				if ( scope.options === undefined ) {

					// Workaround for FireFox. It causes an error if you pass options.
					return createImageBitmap( blob );

				} else {

					return createImageBitmap( blob, scope.options );

				}

			} ).then( function ( imageBitmap ) {

				scope.cache.add( url, imageBitmap );

				if ( onLoad ) onLoad( imageBitmap );

				scope.manager.itemEnd( url );

			} ).catch( function ( e ) {

				if ( onError ) onError( e );

				scope.manager.itemError( url );
				scope.manager.itemEnd( url );

			} );

			scope.manager.itemStart( url );

		}.bind( this );


		var cacheRequest = this.cache.get( url );

		if ( cacheRequest !== undefined ) {

			cacheRequest.onsuccess = function ( data ) {

				scope.manager.itemStart( url );
				onLoad( data );
				scope.manager.itemEnd( url );

			};

			cacheRequest.onerror = function () {

				loadData();

			};

		} else {

			loadData();

		}


	},

	setCrossOrigin: function ( /* value */ ) {

		return this;

	},

	setPath: function ( value ) {

		this.path = value;
		return this;

	}

};

export {
	ImageBitmapLoader
};
