/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MaterialLoader = function () {};

THREE.MaterialLoader.prototype = {

	constructor: THREE.MaterialLoader,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent,

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

		var material;

		switch ( json.type ) {

			case 'MeshBasicMaterial':

				material = new THREE.MeshBasicMaterial( {

					color: json.color,
					opacity: json.opacity,
					transparent: json.transparent,
					wireframe: json.wireframe

				} );

				break;

			case 'MeshLambertMaterial':

				material = new THREE.MeshLambertMaterial( {

					color: json.color,
					ambient: json.ambient,
					emissive: json.emissive,
					opacity: json.opacity,
					transparent: json.transparent,
					wireframe: json.wireframe

				} );

				break;

			case 'MeshPhongMaterial':

				material = new THREE.MeshPhongMaterial( {

					color: json.color,
					ambient: json.ambient,
					emissive: json.emissive,
					specular: json.specular,
					shininess: json.shininess,
					opacity: json.opacity,
					transparent: json.transparent,
					wireframe: json.wireframe

				} );

				break;

			case 'MeshNormalMaterial':

				material = new THREE.MeshNormalMaterial( {

					opacity: json.opacity,
					transparent: json.transparent,
					wireframe: json.wireframe

				} );

				break;

			case 'MeshDepthMaterial':

				material = new THREE.MeshDepthMaterial( {

					opacity: json.opacity,
					transparent: json.transparent,
					wireframe: json.wireframe

				} );

				break;

		}

		return material;

	}

};
