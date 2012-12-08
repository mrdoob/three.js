/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingMonitor = function () {

	THREE.EventTarget.call( this );

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
