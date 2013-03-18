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

		// console.log( json );

		var scene = new THREE.Scene();

		var geometries = [];
		var loader = new THREE.JSONLoader();

		for ( var i = 0, l = json.geometries.length; i < l; i ++ ) {

			geometries.push( loader.parse( json.geometries[ i ] ) );

		}

		// TODO: Implement hierarchy

		for ( var i = 0, l = json.scene.length; i < l; i ++ ) {

			var object = json.scene[ i ];

			switch ( object.type ) {

				case "Mesh":

					var mesh = new THREE.Mesh( geometries[ object.geometry ].geometry ); // TODO: Material
					mesh.position.fromArray( object.position );
					mesh.rotation.fromArray( object.rotation );
					mesh.scale.fromArray( object.scale );
					scene.add( mesh );

					break;

			}

		}

		return scene;

	}

}
