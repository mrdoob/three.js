/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function () {

	var scope = this;

	var loaded = 0, total = 0;

	this.onItemLoad = function () {};

	this.itemStart = function ( url ) {

		total ++;

	};

	this.itemEnd = function ( url ) {

		loaded ++;

		scope.onItemLoad( url, loaded, total );

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
