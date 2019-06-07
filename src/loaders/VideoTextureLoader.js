/**
 * @author mrdoob / http://mrdoob.com/
 * @author Aaron Powell / http://lunadigital.tv
 */

import { RGBFormat, LinearFilter } from '../constants.js';
import { Cache } from './Cache.js';
import { VideoTexture } from '../textures/VideoTexture.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function VideoTextureLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( VideoTextureLoader.prototype, {

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

				scope.manager.itemEnd( url );

			}, 0 );

			return cached;

		}

		var video = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'video' );

		function onVideoLoad() {

			video.removeEventListener( 'loadedmetadata', onVideoLoad, false );
			video.removeEventListener( 'error', onVideoError, false );

			Cache.add( url, this );

			scope.manager.itemEnd( url );

		}

		function onVideoError( event ) {

			video.removeEventListener( 'loadedmetadata', onVideoLoad, false );
			video.removeEventListener( 'error', onVideoError, false );

			if ( onError ) onError( event );

			scope.manager.itemEnd( url );
			scope.manager.itemError( url );

		}

		video.addEventListener( 'loadedmetadata', onVideoLoad, false );
		video.addEventListener( 'error', onVideoError, false );

		if ( url.substr( 0, 5 ) !== 'data:' ) {

			if ( this.crossOrigin !== undefined ) video.crossOrigin = this.crossOrigin;

		}

		scope.manager.itemStart( url );

		video.src = url;
		video.preload = "auto";

		video.setAttribute( 'webkit-playsinline', 'webkit-playsinline' );
		video.setAttribute( 'playsinline', '' );

		var texture = new VideoTexture();

		texture.image = video;

		texture.minFilter = LinearFilter;
		texture.format = RGBFormat;
		texture.needsUpdate = true;

		if ( onLoad !== undefined ) onLoad( texture );

		return texture;

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


export { VideoTextureLoader };
