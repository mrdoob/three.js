/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.BufferGeometryLoader.prototype = {

	constructor: THREE.BufferGeometryLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.XHRLoader();
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var geometry = new THREE.BufferGeometry();

		var attributes = json.attributes;

		for ( var key in attributes ) {

			var attribute = attributes[ key ];

			geometry.attributes[ key ] = {
				itemSize: attribute.itemSize,
				array: new self[ attribute.type ]( attribute.array )
			}

		}

		var offsets = json.offsets;

		if ( offsets !== undefined ) {

			geometry.offsets = JSON.parse( JSON.stringify( offsets ) );

		}

		var boundingSphere = json.boundingSphere;

		if ( boundingSphere !== undefined ) {

			geometry.boundingSphere = new THREE.Sphere(
				new THREE.Vector3().fromArray( boundingSphere.center !== undefined ? boundingSphere.center : [ 0, 0, 0 ] ),
				boundingSphere.radius
			);

		}

		return geometry;

	}

};
