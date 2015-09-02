/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function ( onLoad, onProgress, onError ) {

	var scope = this;

	var isLoading = false, itemsLoaded = 0, itemsTotal = 0, itemsFailed = 0;

	this.onLoad = onLoad;
	this.onProgress = onProgress;
	this.onError = onError;

	this.items = {};

	this.itemStart = function ( url ) {

		itemsTotal ++;

		if( this.items[url] === undefined ) {

			this.items[url] = {
				numStarts: 0,
				numLoaded: 0,
				numFails: 0
			};

		}

		this.items[url].numStarts ++;

		if ( isLoading === false ) {

			if ( scope.onStart !== undefined ) {

				scope.onStart( url, itemsLoaded, itemsTotal, itemsFailed );

			}

		}

		isLoading = true;

	};

	this.itemEnd = function ( url ) {

		itemsLoaded ++;

		this.items[url].numLoaded ++;

		if ( scope.onProgress !== undefined ) {

			scope.onProgress( url, itemsLoaded, itemsTotal, itemsFailed );

		}

		if ( itemsLoaded === itemsTotal ) {

			isLoading = false;

			if ( scope.onLoad !== undefined ) {

				scope.onLoad();

			}

		}

	};

	this.itemFailed = function ( url ) {

		itemsFailed ++;

		this.items[url].numFails ++;
	
		if ( scope.onError !== undefined ) {

			scope.onError( url, itemsLoaded, itemsTotal, itemsFailed );

		}

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
