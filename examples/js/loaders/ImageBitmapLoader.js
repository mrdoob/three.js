/**
 * @author thespite / http://clicktorelease.com/
 */

function detectCreateImageBitmap() {

	var url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

	return new Promise( function ( resolve, reject ) {

		if ( ! ( 'createImageBitmap' in window ) ) {

			reject();
			return;

		}

		fetch( url ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			Promise.all( [
				createImageBitmap( blob, { imageOrientation: 'none', premultiplyAlpha: 'none' } ),
				createImageBitmap( blob, { imageOrientation: 'flipY', premultiplyAlpha: 'none' } ),
				createImageBitmap( blob, { imageOrientation: 'none', premultiplyAlpha: 'premultiply' } ),
				createImageBitmap( blob, { imageOrientation: 'flipY', premultiplyAlpha: 'premultiply' } )
			] ).then( function () {

				resolve();

			} ).catch( function () {

				reject();

			} );

		} );

	} );

}

var canUseImageBitmap = detectCreateImageBitmap();
canUseImageBitmap.then( function () {

	console.log( 'THREE.ImageBitmapLoader: createImageBitmap() supported.' );

} ).catch( function () {

	console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() not supported.' );

} );


THREE.ImageBitmapLoader = function ( manager ) {

	this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;
	this.options = {};

};

THREE.ImageBitmapLoader.prototype = {

	constructor: THREE.ImageBitmapLoader,

	setOptions: function setOptions( options ) {

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

		} ).then( function ( res ) {

			return createImageBitmap( res, scope.options );

		} ).then( function ( res ) {

			THREE.Cache.add( url, res );

			if ( onLoad ) onLoad( res );

			scope.manager.itemEnd( url );

		} ).catch( function ( e ) {

			if ( onError ) onError( e );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		} );

	}

};
