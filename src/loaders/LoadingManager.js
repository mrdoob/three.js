/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function () {

	var scope = this;

	var list = [], cache = {};

	var isLoading = false;
	var loaded = 0, total = 0;

	var crossOrigin = null;

	var load = function () {

		var item = list[ 0 ];

		if ( cache[ item.url ] === undefined ) {

			switch ( item.type ) {

				case 'image':

					var image = document.createElement( 'img' );

					image.addEventListener( 'load', function ( event ) {

						if ( item.onLoad !== undefined ) {

							item.onLoad( this );

						}

						cache[ item.url ] = this;

						onLoad( item );

					}, false );

					if ( crossOrigin !== null ) image.crossOrigin = crossOrigin;

					image.src = item.url;

					break;

				default:

					var request = new XMLHttpRequest();

					request.addEventListener( 'load', function ( event ) {

						if ( item.onLoad !== undefined ) {

							item.onLoad( event );

						}

						cache[ item.url ] = event;

						onLoad( item );

					}, false );

					request.open( 'GET', item.url, true );
					request.send( null );

					break;

			}

		} else {

			if ( item.onLoad !== undefined ) {

				item.onLoad( cache[ item.url ] );

			}

			onLoad( item );

		}

		list.shift();

	};

	var onLoad = function ( item ) {

		loaded ++;

		scope.dispatchEvent( { type: 'load', item: item, loaded: loaded, total: total } );

		if ( loaded === total ) {

			isLoading = false;
			scope.dispatchEvent( { type: 'complete' } );

		} else {

			load();

		}

	};

	this.add = function ( url, type, onLoad, onProgress, onError ) {

		total ++;

		list.push( {
			url: url,
			type: type,
			onLoad: onLoad,
			onProgress: onProgress,
			onError: onError
		} );

		if ( isLoading === false ) {

			isLoading = true;
			load();

		}

	};

	this.setCrossOrigin = function ( value ) {

		crossOrigin = value;

	};

};

THREE.LoadingManager.prototype = {

	constructor: THREE.LoadingManager,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
