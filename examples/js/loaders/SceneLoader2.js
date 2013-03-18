/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.SceneLoader2 = function () {

	THREE.EventDispatcher.call( this );

};

THREE.SceneLoader2.prototype = {

	constructor: THREE.SceneLoader2,

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

		var parseObject = function ( array, parent ) {

			for ( var i = 0, l = array.length; i < l; i ++ ) {

				var object;
				var data = array[ i ];

				switch ( data.type ) {

					case "PerspectiveCamera":

						object = new THREE.PerspectiveCamera( data.fov, data.aspect, data.near, data.far );
						object.name = data.name;
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );
						object.userData = data.userData;
						parent.add( object );

						break;

					case "Mesh":

						object = new THREE.Mesh( geometries[ data.geometry ].geometry ); // TODO: Material
						object.name = data.name;
						object.position.fromArray( data.position );
						object.rotation.fromArray( data.rotation );
						object.scale.fromArray( data.scale );
						object.userData = data.userData;
						parent.add( object );

						break;

					default:

						object = new THREE.Object3D();
						object.name = data.name;
						object.userData = data.userData;
						parent.add( object );

				}

				if ( data.children !== undefined ) {

					parseObject( data.children, object );

				}

			}

		}

		parseObject( json.scene, scene );

		return scene;

	}

}
