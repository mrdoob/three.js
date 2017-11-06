/**
 * @author thespite / http://clicktorelease.com/
 */

function detectCreateImageBitmap ( optionsList ) {

	var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

	return new Promise( function ( resolve, reject ) {

		if ( ! ( 'createImageBitmap' in window ) ) {

			reject();
			return;

		}

		fetch( url ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			var pendingImages = [];

			for ( var i = 0; i < optionsList.length; i ++ ) {

				var pendingImage = optionsList[ i ] === undefined
					? createImageBitmap( blob )
					: createImageBitmap( blob, optionsList[ i ] );

				pendingImages.push( pendingImage );

			}

			Promise.all( pendingImages ).then( function () {

				resolve();

			} ).catch( function () {

				reject();

			} );

		} );

	} );

}

var canUseImageBitmap = detectCreateImageBitmap( [ undefined ] );

var canUseImageBitmapOptions = detectCreateImageBitmap( [
	{ imageOrientation: 'none', premultiplyAlpha: 'none' },
	{ imageOrientation: 'flipY', premultiplyAlpha: 'none' },
	{ imageOrientation: 'none', premultiplyAlpha: 'premultiply' },
	{ imageOrientation: 'flipY', premultiplyAlpha: 'premultiply' }
] );


THREE.ImageBitmapLoader = function ( manager ) {

	canUseImageBitmap.catch( function () {

		console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() not supported.' );

	} );

	this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
	this.options = undefined;

};

THREE.ImageBitmapLoader.prototype = {

	constructor: THREE.ImageBitmapLoader,

	setOptions: function setOptions( options ) {

		canUseImageBitmapOptions.catch( function () {

			console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() options not supported.' );

		} );

		this.options = options;
		return this;

	},

	load: function load( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		var cached = THREE.Cache.get( url );

		if ( cached !== undefined ) {

			scope.manager.itemStart( url );

			setTimeout( function () {

				if ( onLoad ) onLoad( cached );

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		fetch( url ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			return scope.options === undefined
				? createImageBitmap( blob )
				: createImageBitmap( blob, scope.options );

		} ).then( function ( imageBitmap ) {

			THREE.Cache.add( url, imageBitmap );

			if ( onLoad ) onLoad( imageBitmap );

			scope.manager.itemEnd( url );

		} ).catch( function ( e ) {

			if ( onError ) onError( e );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		} );

	}

};
