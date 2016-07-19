/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function ( onLoad, onProgress, onError ) {

	var scope = this;

	var isLoading = false, itemsLoaded = 0, itemsFailed = 0, itemsTotal = 0;

	this.allowErrors = false;
	
	this.onStart = undefined;
	this.onLoad = onLoad;
	this.onProgress = onProgress;
	this.onError = onError;

	this.itemStart = function ( url ) {

		itemsTotal ++;

		if ( isLoading === false ) {

			if ( scope.onStart !== undefined ) {

				scope.onStart( url, itemsLoaded, itemsTotal );

			}

		}

		isLoading = true;

	};

	function onItemDone () {

		if ( itemsLoaded + itemsFailed === itemsTotal ) {

			isLoading = false;

			if ( itemsFailed === 0 || scope.allowErrors ) {

				if ( scope.onLoad !== undefined ) {

					scope.onLoad();

				}

			}


		}

	}

	this.itemEnd = function ( url ) {

		itemsLoaded ++;

		if ( scope.onProgress !== undefined ) {

			scope.onProgress( url, itemsLoaded, itemsTotal );

		}

		onItemDone();

	};

	this.itemError = function ( url ) {

		itemsFailed ++;

		if ( scope.onError !== undefined ) {

			scope.onError( url );

		}

		onItemDone();

	};

	this.setAllowErrors = function ( allowErrors ) {

		this.allowErrors = allowErrors;

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
