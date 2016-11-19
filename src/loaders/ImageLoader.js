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

		} else if ( this.crossOrigin !== undefined ) {

			// crossOrigin doesn't work with URL.createObjectURL()?

			image.crossOrigin = this.crossOrigin;
			image.src = url;

		} else {

			var loader = new FileLoader();
			loader.setPath( this.path );
			loader.setResponseType( 'blob' );
			loader.setWithCredentials( this.withCredentials );
			loader.load( url, function ( blob ) {

				image.src = URL.createObjectURL( blob );

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

	}

} );


export { ImageLoader };
