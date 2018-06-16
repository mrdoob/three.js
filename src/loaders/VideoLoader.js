/**
 * @author mrdoob / http://mrdoob.com/
 * @author Aaron Powell / http://lunadigital.tv
 */

import { Cache } from './Cache.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function VideoLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( VideoLoader.prototype, {

	crossOrigin: 'Anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		url = this.manager.resolveURL( url );

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

		var video = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'video' );

		function onVideoLoad() {

			video.removeEventListener( 'loadeddata', onVideoLoad, false );
			video.removeEventListener( 'error', onVideoError, false );

			Cache.add( url, this );

			if ( onLoad ) onLoad( this );

			scope.manager.itemEnd( url );

		}

		function onVideoError( event ) {

			video.removeEventListener( 'loadeddata', onVideoLoad, false );
			video.removeEventListener( 'error', onVideoError, false );

			if ( onError ) onError( event );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		}

		video.addEventListener( 'loadeddata', onVideoLoad, false );
		video.addEventListener( 'error', onVideoError, false );

		if ( url.substr( 0, 5 ) !== 'data:' ) {

			if ( this.crossOrigin !== undefined ) video.crossOrigin = this.crossOrigin;

		}

		scope.manager.itemStart( url );

		video.src = url;

		return video;

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


export { VideoLoader };
