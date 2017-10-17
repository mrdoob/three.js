/**
 * @author mrdoob / http://mrdoob.com/
 */

import { Cache } from './Cache.js';
import { DefaultLoadingManager } from './LoadingManager.js';


function ImageLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

Object.assign( ImageLoader.prototype, {

	crossOrigin: 'Anonymous',

	load: function ( url, onLoad, onProgress, onError ) {

		if ( url === undefined ) url = '';

		if ( this.path !== undefined ) url = this.path + url;

		var scope = this;

		return Cache.retrieve(url, function(_onLoad, _onProgress, _onError) {

			var image = document.createElementNS('http://www.w3.org/1999/xhtml', 'img');

			image.addEventListener('load', function () {

				_onLoad(this);

				scope.manager.itemEnd(url);

			}, false);

			/*
			image.addEventListener( 'progress', function ( event ) {

				if ( onProgress ) onProgress( event );

			}, false );
			*/

			image.addEventListener('error', function (event) {

				_onError(event);

				scope.manager.itemEnd(url);
				scope.manager.itemError(url);

			}, false);

			if (url.substr(0, 5) !== 'data:') {

				if (scope.crossOrigin !== undefined) image.crossOrigin = scope.crossOrigin;

			}

			scope.manager.itemStart(url);

			image.src = url;

			return image;
		}, onLoad, onProgress, onError);
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


export { ImageLoader };
