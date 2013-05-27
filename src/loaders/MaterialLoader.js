/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MaterialLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MaterialLoader.prototype = {

	constructor: THREE.MaterialLoader,

	load: function ( url, callback ) {

		var scope = this;

		this.manager.add( url, 'text', function ( event ) {

			if ( callback !== undefined ) {

				var material = scope.parse( JSON.parse( event.target.responseText ) );
				callback( material );

			}

		} );

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
