/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneLoader2 = function () {

	THREE.EventDispatcher.call( this );

};

THREE.SceneLoader2.prototype = {

	constructor: THREE.SceneExporter2,

	load: function ( url ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var response = scope.parse( JSON.parse( event.target.responseText ) );

			scope.dispatchEvent( { type: 'load', content: response } );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.send( null );

	},

	parse: function ( json ) {

		console.log( json );

		var geometries = [];
		var loader = new THREE.JSONLoader();

		for ( var i = 0, l = json.geometries.length; i < l; i ++ ) {

			console.log( json.geometries[ i ] );

			geometries.push( loader.createModel( json.geometries[ i ] ) );

		}

		console.log( geometries );

	}

}
