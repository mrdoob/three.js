import { Sphere } from '../math/Sphere.js';
import { BufferAttribute } from '../core/BufferAttribute.js';
import { BufferGeometry } from '../core/BufferGeometry.js';
import { FileLoader } from './FileLoader.js';
import { Loader } from './Loader.js';
import { InstancedBufferGeometry } from '../core/InstancedBufferGeometry.js';
import { InstancedBufferAttribute } from '../core/InstancedBufferAttribute.js';
import { InterleavedBufferAttribute } from '../core/InterleavedBufferAttribute.js';
import { InterleavedBuffer } from '../core/InterleavedBuffer.js';
import { getTypedArray, error } from '../utils.js';

/**
 * Class for loading geometries. The files are internally
 * loaded via {@link FileLoader}.
 *
 * ```js
 * const loader = new THREE.BufferGeometryLoader();
 * const geometry = await loader.loadAsync( 'models/json/pressure.json' );
 *
 * const material = new THREE.MeshBasicMaterial( { color: 0xF5F5F5 } );
 * const object = new THREE.Mesh( geometry, material );
 * scene.add( object );
 * ```
 *
 * @augments Loader
 */
class BufferGeometryLoader extends Loader {

	/**
	 * Constructs a new geometry loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and pass the loaded geometry to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( JSON.parse( text ) ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	/**
	 * Parses the given JSON object and returns a geometry.
	 *
	 * @param {Object} json - The serialized geometry.
	 * @return {BufferGeometry} The parsed geometry.
	 */
	parse( json ) {

		const interleavedBufferMap = {};
		const arrayBufferMap = {};

		function getInterleavedBuffer( json, uuid ) {

			if ( interleavedBufferMap[ uuid ] !== undefined ) return interleavedBufferMap[ uuid ];

			const interleavedBuffers = json.interleavedBuffers;
			const interleavedBuffer = interleavedBuffers[ uuid ];

			const buffer = getArrayBuffer( json, interleavedBuffer.buffer );

			const array = getTypedArray( interleavedBuffer.type, buffer );
			const ib = new InterleavedBuffer( array, interleavedBuffer.stride );
			ib.uuid = interleavedBuffer.uuid;

			interleavedBufferMap[ uuid ] = ib;

			return ib;

		}

		function getArrayBuffer( json, uuid ) {

			if ( arrayBufferMap[ uuid ] !== undefined ) return arrayBufferMap[ uuid ];

			const arrayBuffers = json.arrayBuffers;
			const arrayBuffer = arrayBuffers[ uuid ];

			const ab = new Uint32Array( arrayBuffer ).buffer;

			arrayBufferMap[ uuid ] = ab;

			return ab;

		}

		const geometry = json.isInstancedBufferGeometry ? new InstancedBufferGeometry() : new BufferGeometry();

		const index = json.data.index;

		if ( index !== undefined ) {

			const typedArray = getTypedArray( index.type, index.array );
			geometry.setIndex( new BufferAttribute( typedArray, 1 ) );

		}

		const attributes = json.data.attributes;

		for ( const key in attributes ) {

			const attribute = attributes[ key ];
			let bufferAttribute;

			if ( attribute.isInterleavedBufferAttribute ) {

				const interleavedBuffer = getInterleavedBuffer( json.data, attribute.data );
				bufferAttribute = new InterleavedBufferAttribute( interleavedBuffer, attribute.itemSize, attribute.offset, attribute.normalized );

			} else {

				const typedArray = getTypedArray( attribute.type, attribute.array );
				const bufferAttributeConstr = attribute.isInstancedBufferAttribute ? InstancedBufferAttribute : BufferAttribute;
				bufferAttribute = new bufferAttributeConstr( typedArray, attribute.itemSize, attribute.normalized );

			}

			if ( attribute.name !== undefined ) bufferAttribute.name = attribute.name;
			if ( attribute.usage !== undefined ) bufferAttribute.setUsage( attribute.usage );

			geometry.setAttribute( key, bufferAttribute );

		}

		const morphAttributes = json.data.morphAttributes;

		if ( morphAttributes ) {

			for ( const key in morphAttributes ) {

				const attributeArray = morphAttributes[ key ];

				const array = [];

				for ( let i = 0, il = attributeArray.length; i < il; i ++ ) {

					const attribute = attributeArray[ i ];
					let bufferAttribute;

					if ( attribute.isInterleavedBufferAttribute ) {

						const interleavedBuffer = getInterleavedBuffer( json.data, attribute.data );
						bufferAttribute = new InterleavedBufferAttribute( interleavedBuffer, attribute.itemSize, attribute.offset, attribute.normalized );

					} else {

						const typedArray = getTypedArray( attribute.type, attribute.array );
						bufferAttribute = new BufferAttribute( typedArray, attribute.itemSize, attribute.normalized );

					}

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

			geometry.boundingSphere = new Sphere().fromJSON( boundingSphere );

		}

		if ( json.name ) geometry.name = json.name;
		if ( json.userData ) geometry.userData = json.userData;

		return geometry;

	}

}

export { BufferGeometryLoader };
