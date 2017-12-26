/**
 * @author mrdoob / http://mrdoob.com/
 */

import { EventDispatcher } from '../core/EventDispatcher'

function LoadingManager( onLoad, onProgress, onError ) {

	var scope = this;

	var isLoading = false;
	var itemsLoaded = 0;
	var itemsTotal = 0;
	var urlModifier = undefined;

	this.onStart = undefined;
	this.onLoad = onLoad;
	this.onProgress = onProgress;
	this.onError = onError;

	this.itemStart = function ( url ) {

		itemsTotal ++;

		scope.dispatchEvent( { type: 'start', url: url } );

		if ( isLoading === false ) {

			if ( scope.onStart !== undefined ) {

				scope.onStart( url, itemsLoaded, itemsTotal );

			}

		}

		isLoading = true;

	};

	this.itemEnd = function ( url ) {

		itemsLoaded ++;

		scope.dispatchEvent( { type: 'progress', url: url, loaded: itemsLoaded, total: itemsTotal } );

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

		scope.dispatchEvent( { type: 'error', url: url } );

		if ( scope.onError !== undefined ) {

			scope.onError( url );

		}

	};

	this.resolveURL = function ( url ) {

		if ( urlModifier ) {

			return urlModifier( url );

		}

		return url;

	};

	this.setURLModifier = function ( transform ) {

		urlModifier = transform;
		return this;

	};

}

LoadingManager.prototype = Object.assign( Object.create( EventDispatcher.prototype ), {

	constructor: LoadingManager

} );

var DefaultLoadingManager = new LoadingManager();

export {
	DefaultLoadingManager,
	LoadingManager
};
