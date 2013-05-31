/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.GeometryLoader = function ( crossOrigin ) {

	this.crossOrigin = crossOrigin;

};

THREE.GeometryLoader.prototype = {

	constructor: THREE.GeometryLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var request = new XMLHttpRequest();

		if ( onLoad !== undefined ) {

			request.addEventListener( 'load', function ( event ) {

				onLoad( scope.parse( JSON.parse( event.target.responseText ) ) );

			}, false );

		}

		if ( onProgress !== undefined ) {

			request.addEventListener( 'progress', function ( event ) {

				onProgress( event );

			}, false );

		}

		if ( onError !== undefined ) {

			request.addEventListener( 'error', function ( event ) {

				onError( event );

			}, false );

		}

		if ( this.crossOrigin !== undefined ) request.crossOrigin = this.crossOrigin;

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( json ) {

		

	}

};
