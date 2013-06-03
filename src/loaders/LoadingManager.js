/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function ( onLoad, onProgress, onError ) {

	var scope = this;

	var loaders = {};
	var queue = [];
	var cache = {};

	var loaded = 0, total = 0;

	var loadNext = function () {

		var item = queue[ 0 ];

		if ( cache[ item.url ] === undefined ) {

			var loader = loaders[ item.type ];

			if ( loader !== undefined ) {

				loader.load( item.url, function ( event ) {

					if ( item.onLoad !== undefined ) {

						item.onLoad( event );

					}

					cache[ item.url ] = event;

					onItemLoaded( item );

				} );

			}

		} else {

			if ( item.onLoad !== undefined ) {

				item.onLoad( cache[ item.url ] );

			}

			onLoad( item );

		}

		queue.shift();

	};

	var onItemLoaded = function ( item ) {

		loaded ++;

		onProgress( item, loaded, total );

		if ( queue.length > 0 ) {

			loadNext();

		}

		if ( loaded === total ) {

			onLoad();

		}

	};

	this.add = function ( url, onLoad, onProgress, onError ) {

		total ++;

		queue.push( {
			url: url,
			onLoad: onLoad,
			onProgress: onProgress,
			onError: onError
		} );

		loadNext();

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
