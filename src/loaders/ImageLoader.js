/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = ImageLoader;

var Cache = require( "./Cache" ),
	DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager;

function ImageLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

ImageLoader.prototype = {

	constructor: ImageLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var cached = Cache.get( url );

		if ( cached !== undefined ) {

			if ( onLoad ) {

				setTimeout( function () {

					onLoad( cached );

				}, 0 );

			}

			return cached;

		}

		var image = document.createElement( "img" );

		image.addEventListener( "load", function () {

			Cache.add( url, this );

			if ( onLoad ) { onLoad( this ); }

			scope.manager.itemEnd( url );

		}, false );

		if ( onProgress !== undefined ) {

			image.addEventListener( "progress", function ( event ) {

				onProgress( event );

			}, false );

		}

		image.addEventListener( "error", function ( event ) {

			if ( onError ) { onError( event ); }

			scope.manager.itemError( url );

		}, false );

		if ( this.crossOrigin !== undefined ) { image.crossOrigin = this.crossOrigin; }

		scope.manager.itemStart( url );

		image.src = url;

		return image;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
