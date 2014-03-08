/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.XHRLoader = function ( manager ) {

	this.cache = new THREE.Cache();
	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.XHRLoader.prototype = {

	constructor: THREE.XHRLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var cached = scope.cache.get( url );

		if ( cached !== undefined ) {

			onLoad( cached );
			return;

		}

		var request = new XMLHttpRequest();

		if ( onLoad !== undefined ) {

			request.addEventListener( 'load', function ( event ) {

				scope.cache.add( url, event.target.responseText );

				onLoad( event.target.responseText );
				scope.manager.itemEnd( url );

			}, false );

		}

		if ( onProgress !== undefined ) {

			request.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		if ( onError !== undefined ) {

			request.addEventListener( 'error', function ( event ) {

				onError( event );

			}, false );

		}

		if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;

		request.open( 'GET', url, true );
		request.send( null );

		scope.manager.itemStart( url );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	}

};
