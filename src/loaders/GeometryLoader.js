/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GeometryLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.GeometryLoader.prototype = {

	constructor: THREE.GeometryLoader,

	load: function ( url, callback ) {

		var scope = this;

		this.manager.add( url, 'text', function ( event ) {

			if ( callback !== undefined ) {

				callback( scope.parse( JSON.parse( event.target.responseText ) ) );

			}

		} );

	},

	parse: function ( json ) {

		

	}

};
