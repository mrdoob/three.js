/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ImageLoader.prototype = {

	constructor: THREE.ImageLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;
		var request = new XMLHttpRequest();
		var image = new Image();

		if ( onLoad !== undefined ) {

			request.onload = function () {

				image.src = window.URL.createObjectURL( request.response );
				
				image.onload = function () {

					scope.manager.itemEnd( url );
					onLoad( this );

				}

			}

		}

		request.onprogress = onProgress;
		request.onerror = onError;

		request.open( 'GET', url, true );
		request.responseType = 'blob';
		request.send( null );

		scope.manager.itemStart( url );

		return image;

	}

}
