/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.ImageLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.ImageLoader.prototype = {

	constructor: THREE.ImageLoader,

	load: function ( url, callback ) {

		var scope = this;

		this.manager.add( url, 'image', function ( image ) {

			if ( callback !== undefined ) {

				callback( image );

			}

		} );

	}

}
