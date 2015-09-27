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

		var loader = new THREE.XHRLoader( scope.manager );
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

		var index = json.data.index;

		if ( index !== undefined ) {

			var typedArray = new self[ index.type ]( index.array );
			geometry.setIndex( new THREE.BufferAttribute( typedArray, 1 ) );

		}

		var attributes = json.data.attributes;

		for ( var key in attributes ) {

			var attribute = attributes[ key ];
			var typedArray = new self[ attribute.type ]( attribute.array );

			geometry.addAttribute( key, new THREE.BufferAttribute( typedArray, attribute.itemSize ) );

		}

		var groups = json.data.groups || json.data.drawcalls || json.data.offsets;

		if ( groups !== undefined ) {

			for ( var i = 0, n = groups.length; i !== n; ++ i ) {

				var group = groups[ i ];

				geometry.addGroup( group.start, group.count );

			}

		}

		var boundingSphere = json.data.boundingSphere;

		if ( boundingSphere !== undefined ) {

			var center = new THREE.Vector3();

			if ( boundingSphere.center !== undefined ) {

				center.fromArray( boundingSphere.center );

			}

			geometry.boundingSphere = new THREE.Sphere( center, boundingSphere.radius );

		}

		return geometry;

	}

};
