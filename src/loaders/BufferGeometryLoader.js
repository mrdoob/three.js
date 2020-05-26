import { Sphere } from '../math/Sphere.js';
import { Vector3 } from '../math/Vector3.js';
import { BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry.js';
import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function BufferGeometryLoader( manager ) {

	Loader.call( this, manager );

}

BufferGeometryLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: BufferGeometryLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	},

	parse: function ( json ) {

		var geometry = json.isInstancedBufferGeometry ? new InstancedBufferGeometry() : new BufferGeometry();

		var index = json.data.index;

		if ( index !== undefined ) {

			var typedArray = new TYPED_ARRAYS[ index.type ]( index.array );
			geometry.setIndex( new BufferAttribute( typedArray, 1 ) );

		}

		var attributes = json.data.attributes;

		for ( var key in attributes ) {

			var attribute = attributes[ key ];
			var typedArray = new TYPED_ARRAYS[ attribute.type ]( attribute.array );
			var bufferAttributeConstr = attribute.isInstancedBufferAttribute ? InstancedBufferAttribute : BufferAttribute;
			var bufferAttribute = new bufferAttributeConstr( typedArray, attribute.itemSize, attribute.normalized );
			if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
			geometry.setAttribute( key, bufferAttribute );

		}

		var morphAttributes = json.data.morphAttributes;

		if ( morphAttributes ) {

			for ( var key in morphAttributes ) {

				var attributeArray = morphAttributes[ key ];

				var array = [];

				for ( var i = 0, il = attributeArray.length; i < il; i ++ ) {

					var attribute = attributeArray[ i ];
					var typedArray = new TYPED_ARRAYS[ attribute.type ]( attribute.array );

					var bufferAttribute = new BufferAttribute( typedArray, attribute.itemSize, attribute.normalized );
					if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
					array.push( bufferAttribute );

				}

				geometry.morphAttributes[ key ] = array;

			}

		}

		var morphTargetsRelative = json.data.morphTargetsRelative;

		if ( morphTargetsRelative ) {

			geometry.morphTargetsRelative = true;

		}

		var groups = json.data.groups || json.data.drawcalls || json.data.offsets;

		if ( groups !== undefined ) {

			for ( var i = 0, n = groups.length; i !== n; ++ i ) {

				var group = groups[ i ];

				geometry.addGroup( group.start, group.count, group.materialIndex );

			}

		}

		var boundingSphere = json.data.boundingSphere;

		if ( boundingSphere !== undefined ) {

			var center = new Vector3();

			if ( boundingSphere.center !== undefined ) {

				center.fromArray( boundingSphere.center );

			}

			geometry.boundingSphere = new Sphere( center, boundingSphere.radius );

		}

		if ( json.name ) geometry.name = json.name;
		if ( json.userData ) geometry.userData = json.userData;

		return geometry;

	}

} );

var TYPED_ARRAYS = {
	Int8Array: Int8Array,
	Uint8Array: Uint8Array,
	// Workaround for IE11 pre KB2929437. See #11440
	Uint8ClampedArray: typeof Uint8ClampedArray !== 'undefined' ? Uint8ClampedArray : Uint8Array,
	Int16Array: Int16Array,
	Uint16Array: Uint16Array,
	Int32Array: Int32Array,
	Uint32Array: Uint32Array,
	Float32Array: Float32Array,
	Float64Array: Float64Array
};

export { BufferGeometryLoader };
