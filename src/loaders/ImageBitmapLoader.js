import { Cache } from './Cache.js';
import { Loader } from './Loader.js';

function ImageBitmapLoader( manager ) {

	if ( typeof createImageBitmap === 'undefined' ) {

		console.warn( 'THREE.ImageBitmapLoader: createImageBitmap() not supported.' );

	}

	if ( typeof fetch === 'undefined' ) {

		console.warn( 'THREE.ImageBitmapLoader: fetch() not supported.' );

	}

	Loader.call( this, manager );

	this.options = { premultiplyAlpha: 'none' };

}

ImageBitmapLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: ImageBitmapLoader,

	isImageBitmapLoader: true,

	setOptions: function setOptions( options ) {

		this.options = options;

		return this;

	},

	load: function ( url, onLoad, onProgress, onError ) {

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

		fetch( url ).then( function ( res ) {

			return res.blob();

		} ).then( function ( blob ) {

			return createImageBitmap( blob, scope.options );

		} ).then( function ( imageBitmap ) {

			Cache.add( url, imageBitmap );

			if ( onLoad ) onLoad( imageBitmap );

			scope.manager.itemEnd( url );

		} ).catch( function ( e ) {

			if ( onError ) onError( e );

			scope.manager.itemError( url );
			scope.manager.itemEnd( url );

		} );

		scope.manager.itemStart( url );

	}

} );

export { ImageBitmapLoader };
