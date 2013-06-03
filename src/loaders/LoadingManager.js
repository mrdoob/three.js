/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.LoadingManager = function ( onItemLoad ) {

	var scope = this;

	var loaded = 0, total = 0;

	this.itemStart = function ( url ) {

		total ++;

	};

	this.itemEnd = function ( url ) {

		loaded ++;

		if ( onItemLoad !== undefined ) {

			onItemLoad( url, loaded, total );

		}

	};

};

THREE.DefaultLoadingManager = new THREE.LoadingManager();
