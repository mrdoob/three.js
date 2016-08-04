import { Sphere } from '../math/Sphere';
import { Vector3 } from '../math/Vector3';
import { BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { XHRLoader } from './XHRLoader';
import { DefaultLoadingManager } from './LoadingManager';

/**
 * @author mrdoob / http://mrdoob.com/
 */

function BufferGeometryLoader( manager ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;

};

Object.assign( BufferGeometryLoader.prototype, {

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new XHRLoader( scope.manager );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( JSON.parse( text ) ) );

		}, onProgress, onError );

	},

	parse: function ( json ) {

		var geometry = new BufferGeometry();

		var index = json.data.index;

		var TYPED_ARRAYS = {
			'Int8Array': Int8Array,
			'Uint8Array': Uint8Array,
			'Uint8ClampedArray': Uint8ClampedArray,
			'Int16Array': Int16Array,
			'Uint16Array': Uint16Array,
			'Int32Array': Int32Array,
			'Uint32Array': Uint32Array,
			'Float32Array': Float32Array,
			'Float64Array': Float64Array
		};

		if ( index !== undefined ) {

			var typedArray = new TYPED_ARRAYS[ index.type ]( index.array );
			geometry.setIndex( new BufferAttribute( typedArray, 1 ) );

		}

		var attributes = json.data.attributes;

		for ( var key in attributes ) {

			var attribute = attributes[ key ];
			var typedArray = new TYPED_ARRAYS[ attribute.type ]( attribute.array );

			geometry.addAttribute( key, new BufferAttribute( typedArray, attribute.itemSize, attribute.normalized ) );

		}

		var morphAttributes = json.data.morphAttributes;

		if ( morphAttributes !== undefined ) {

			for ( var type in morphAttributes ) {

				attribute = attributes[ type ];

				if ( attribute === undefined ) {

					console.warn( 'no matching ' + type + ' attribute found for morphAttribute: ', type );

				}

				var morphAttributeType = morphAttributes[ type ];

				var array = [];

				for ( var name in morphAttributeType ) {

					var morphAttribute = morphAttributeType[ name ];

					if ( attribute.type !== morphAttribute.type || attribute.itemSize !== morphAttribute.itemSize || attribute.array.length !== morphAttribute.array.length ) {

						console.warn( 'morph attribute ' + type + ' type does not match attribute ' + type + ' type' );

					}

					var typedArray = new TYPED_ARRAYS[ morphAttribute.type ]( morphAttribute.array );
					var bufferAtrribute = new BufferAttribute( typedArray, morphAttribute.itemSize, morphAttribute.normalized );

					// !!! Fix this - AnimationClip expects 
					// a name property, but BufferAttribute's don't have a name property !!!
					bufferAtrribute.name = morphAttribute.name;

					array.push( bufferAtrribute );

				}

				geometry.morphAttributes[ type ] = array;

			}

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

		return geometry;

	}

} );


export { BufferGeometryLoader };
