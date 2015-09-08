/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = XHRLoader;

var Cache = require( "./Cache" ),
	DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager;

function XHRLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

XHRLoader.prototype = {

	constructor: XHRLoader,

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

		var request = new XMLHttpRequest();
		request.open( "GET", url, true );

		request.addEventListener( "load", function () {

			Cache.add( url, this.response );

			if ( onLoad ) { onLoad( this.response ); }

			scope.manager.itemEnd( url );

		}, false );

		if ( onProgress !== undefined ) {

			request.addEventListener( "progress", function ( event ) {

				onProgress( event );

			}, false );

		}

		request.addEventListener( "error", function ( event ) {

			if ( onError ) { onError( event ); }

			scope.manager.itemError( url );

		}, false );

		if ( this.crossOrigin !== undefined ) { request.crossOrigin = this.crossOrigin; }
		if ( this.responseType !== undefined ) { request.responseType = this.responseType; }
		if ( this.withCredentials !== undefined ) { request.withCredentials = this.withCredentials; }

		request.send( null );

		scope.manager.itemStart( url );

		return request;

	},

	setResponseType: function ( value ) {

		this.responseType = value;

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	setWithCredentials: function ( value ) {

		this.withCredentials = value;

	}

};
