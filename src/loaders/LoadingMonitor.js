/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingMonitor = function () {

	var scope = this;

	var loaded = 0;
	var total = 0;

	var onLoad = function ( event ) {

		loaded ++;

		scope.dispatchEvent( { type: 'progress', loaded: loaded, total: total } );

		if ( loaded === total ) {

			scope.dispatchEvent( { type: 'load' } );

		}

	};

	this.add = function ( loader ) {

		total ++;

		loader.addEventListener( 'load', onLoad, false );

	};

};

THREE.LoadingMonitor.prototype = {

	constructor: THREE.LoadingMonitor,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent

};
