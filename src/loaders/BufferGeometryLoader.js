/**
 * @author mrdoob / http://mrdoob.com/
 */

module.exports = BufferGeometryLoader;

var DefaultLoadingManager = require( "./LoadingManager" ).DefaultLoadingManager,
	XHRLoader = require( "./XHRLoader" ),
	BufferAttribute = require( "../core/BufferAttribute" ),
	BufferGeometry = require( "../core/BufferGeometry" ),
	Sphere = require( "../math/Sphere" ),
	Vector3 = require( "../math/Vector3" );

function BufferGeometryLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

}

BufferGeometryLoader.prototype = {

	constructor: BufferGeometryLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new XHRLoader( scope.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	parse: function ( json ) {

		var geometry = new BufferGeometry();

		var index = json.data.index, typedArray;

		if ( index !== undefined ) {

			typedArray = new self[ index.type ]( index.array );
			geometry.addIndex( new BufferAttribute( typedArray, 1 ) );

		}

		var key, attribute, attributes = json.data.attributes;

		for ( key in attributes ) {

			attribute = attributes[ key ];
			typedArray = new self[ attribute.type ]( attribute.array );

			geometry.addAttribute( key, new BufferAttribute( typedArray, attribute.itemSize ) );

		}

		var groups = json.data.groups || json.data.drawcalls || json.data.offsets;
		var i, n, group;

		if ( groups !== undefined ) {

			for ( i = 0, n = groups.length; i !== n; ++ i ) {

				group = groups[ i ];

				geometry.addGroup( group.start, group.count );

			}

		}

		var boundingSphere = json.data.boundingSphere;
		var center;

		if ( boundingSphere !== undefined ) {

			center = new Vector3();

			if ( boundingSphere.center !== undefined ) {

				center.fromArray( boundingSphere.center );

			}

			geometry.boundingSphere = new Sphere( center, boundingSphere.radius );

		}

		return geometry;

	}

};
