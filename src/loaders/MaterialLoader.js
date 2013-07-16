/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.MaterialLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MaterialLoader.prototype = {

	constructor: THREE.MaterialLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader();
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		} );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

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

		if ( json.vertexColors !== undefined ) material.vertexColors = json.vertexColors;

		return material;

	}

};
