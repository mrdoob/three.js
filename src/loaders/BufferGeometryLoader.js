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

		} );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var geometry = new THREE.BufferGeometry();

		for ( var key in json.attributes ) {

			var attribute = json.attributes[ key ];
			geometry.attributes[ key ] = {
				itemSize: attribute.itemSize,
				array: new self[ attribute.type ]( attribute.array )
			}

		}

		if ( json.offsets !== undefined ) {

			geometry.offsets = JSON.parse( JSON.stringify( json.offsets ) );

		}

		return geometry;

	}

};
