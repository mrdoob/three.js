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

		const scope = this;

		const loader = new FileLoader( scope.manager );
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

		const geometry = json.isInstancedBufferGeometry ? new InstancedBufferGeometry() : new BufferGeometry();

		const index = json.data.index;

		if ( index !== undefined ) {

			const typedArray = new TYPED_ARRAYS[ index.type ]( index.array );
			geometry.setIndex( new BufferAttribute( typedArray, 1 ) );

		}

		const attributes = json.data.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];
			const typedArray = new TYPED_ARRAYS[ attribute.type ]( attribute.array );
			const bufferAttributeConstr = attribute.isInstancedBufferAttribute ? InstancedBufferAttribute : BufferAttribute;
			const bufferAttribute = new bufferAttributeConstr( typedArray, attribute.itemSize, attribute.normalized );
			if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
			geometry.setAttribute( key, bufferAttribute );

		}

		const morphAttributes = json.data.morphAttributes;

		if ( morphAttributes ) {

			for ( const key in morphAttributes ) {

				const attributeArray = morphAttributes[ key ];

				const array = [];

				for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

					const attribute = attributeArray[ i ];
					const typedArray = new TYPED_ARRAYS[ attribute.type ]( attribute.array );

					const bufferAttribute = new BufferAttribute( typedArray, attribute.itemSize, attribute.normalized );
					if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
					array.push( bufferAttribute );

				}

				geometry.morphAttributes[ key ] = array;

			}

		}

		const morphTargetsRelative = json.data.morphTargetsRelative;

		if ( morphTargetsRelative ) {

			geometry.morphTargetsRelative = true;

		}

		const groups = json.data.groups || json.data.drawcalls || json.data.offsets;

		if ( groups !== undefined ) {

			for ( let i = 0, n = groups.length; i !== n; ++ i ) {

				const group = groups[ i ];

				geometry.addGroup( group.start, group.count, group.materialIndex );

			}

		}

		const boundingSphere = json.data.boundingSphere;

		if ( boundingSphere !== undefined ) {

			const center = new Vector3();

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

const TYPED_ARRAYS = {
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
