/**
 * @author mrdoob / http://mrdoob.com/
 */

function LoadingManager( onLoad, onProgress, onError ) {

	var scope = this;

	var isLoading = false, itemsLoaded = 0, itemsTotal = 0, items = [];

	this.onStart = undefined;
	this.onLoad = onLoad;
	this.onProgress = onProgress;
	this.onError = onError;

	this.itemStart = function ( url, item ) {

		itemsTotal ++;

		if ( item ) {

			items.push( item );

		}

		if ( isLoading === false ) {

			if ( scope.onStart !== undefined ) {

				scope.onStart( url, itemsLoaded, itemsTotal );

			}

		}

		isLoading = true;

	};

	this.itemEnd = function ( url, item ) {

		itemsLoaded ++;

		if ( item ) {

			var index = items.indexOf( item );
			if ( index >= 0 ) {

				items.splice( index, 1 );

			}

		}

		if ( scope.onProgress !== undefined ) {

			scope.onProgress( url, itemsLoaded, itemsTotal );

		}

		if ( itemsLoaded === itemsTotal ) {

			isLoading = false;

			if ( scope.onLoad !== undefined ) {

				scope.onLoad();

			}

		}

	};

	this.itemError = function ( url ) {

		if ( scope.onError !== undefined ) {

			scope.onError( url );

		}

	};

	this.abortAll = function () {

		for ( var i = 0; i < items.length; i ++ ) {

			items[ i ].abort();

		}

		items = [];

	};

}

var DefaultLoadingManager = new LoadingManager();


export { DefaultLoadingManager, LoadingManager };
