import {
	BufferAttribute,
	BufferGeometry,
	FileLoader,
	Loader
} from '../../../build/three.module.js';

/**
 * See https://github.com/kchapelier/PRWM for more informations about this file format
 */

let bigEndianPlatform = null;

/**
	 * Check if the endianness of the platform is big-endian (most significant bit first)
	 * @returns {boolean} True if big-endian, false if little-endian
	 */
function isBigEndianPlatform() {

	if ( bigEndianPlatform === null ) {

		const buffer = new ArrayBuffer( 2 ),
			uint8Array = new Uint8Array( buffer ),
			uint16Array = new Uint16Array( buffer );

		uint8Array[ 0 ] = 0xAA; // set first byte
		uint8Array[ 1 ] = 0xBB; // set second byte
		bigEndianPlatform = ( uint16Array[ 0 ] === 0xAABB );

	}

	return bigEndianPlatform;

}

// match the values defined in the spec to the TypedArray types
const InvertedEncodingTypes = [
	null,
	Float32Array,
	null,
	Int8Array,
	Int16Array,
	null,
	Int32Array,
	Uint8Array,
	Uint16Array,
	null,
	Uint32Array
];

// define the method to use on a DataView, corresponding the TypedArray type
const getMethods = {
	Uint16Array: 'getUint16',
	Uint32Array: 'getUint32',
	Int16Array: 'getInt16',
	Int32Array: 'getInt32',
	Float32Array: 'getFloat32',
	Float64Array: 'getFloat64'
};


function copyFromBuffer( sourceArrayBuffer, viewType, position, length, fromBigEndian ) {

	const bytesPerElement = viewType.BYTES_PER_ELEMENT;
	let result;

	if ( fromBigEndian === isBigEndianPlatform() || bytesPerElement === 1 ) {

		result = new viewType( sourceArrayBuffer, position, length );

	} else {

		const readView = new DataView( sourceArrayBuffer, position, length * bytesPerElement ),
			getMethod = getMethods[ viewType.name ],
			littleEndian = ! fromBigEndian;

		result = new viewType( length );

		for ( let i = 0; i < length; i ++ ) {

			result[ i ] = readView[ getMethod ]( i * bytesPerElement, littleEndian );

		}

	}

	return result;

}


function decodePrwm( buffer ) {

	const array = new Uint8Array( buffer ),
		version = array[ 0 ];

	let flags = array[ 1 ];

	const indexedGeometry = !! ( flags >> 7 & 0x01 ),
		indicesType = flags >> 6 & 0x01,
		bigEndian = ( flags >> 5 & 0x01 ) === 1,
		attributesNumber = flags & 0x1F;

	let valuesNumber = 0,
		indicesNumber = 0;

	if ( bigEndian ) {

		valuesNumber = ( array[ 2 ] << 16 ) + ( array[ 3 ] << 8 ) + array[ 4 ];
		indicesNumber = ( array[ 5 ] << 16 ) + ( array[ 6 ] << 8 ) + array[ 7 ];

	} else {

		valuesNumber = array[ 2 ] + ( array[ 3 ] << 8 ) + ( array[ 4 ] << 16 );
		indicesNumber = array[ 5 ] + ( array[ 6 ] << 8 ) + ( array[ 7 ] << 16 );

	}

	/** PRELIMINARY CHECKS **/

	if ( version === 0 ) {

		throw new Error( 'PRWM decoder: Invalid format version: 0' );

	} else if ( version !== 1 ) {

		throw new Error( 'PRWM decoder: Unsupported format version: ' + version );

	}

	if ( ! indexedGeometry ) {

		if ( indicesType !== 0 ) {

			throw new Error( 'PRWM decoder: Indices type must be set to 0 for non-indexed geometries' );

		} else if ( indicesNumber !== 0 ) {

			throw new Error( 'PRWM decoder: Number of indices must be set to 0 for non-indexed geometries' );

		}

	}

	/** PARSING **/

	let pos = 8;

	const attributes = {};

	for ( let i = 0; i < attributesNumber; i ++ ) {

		let attributeName = '';

		while ( pos < array.length ) {

			const char = array[ pos ];
			pos ++;

			if ( char === 0 ) {

				break;

			} else {

				attributeName += String.fromCharCode( char );

			}

		}

		flags = array[ pos ];

		const attributeType = flags >> 7 & 0x01;
		const cardinality = ( flags >> 4 & 0x03 ) + 1;
		const encodingType = flags & 0x0F;
		const arrayType = InvertedEncodingTypes[ encodingType ];

		pos ++;

		// padding to next multiple of 4
		pos = Math.ceil( pos / 4 ) * 4;

		const values = copyFromBuffer( buffer, arrayType, pos, cardinality * valuesNumber, bigEndian );

		pos += arrayType.BYTES_PER_ELEMENT * cardinality * valuesNumber;

		attributes[ attributeName ] = {
			type: attributeType,
			cardinality: cardinality,
			values: values
		};

	}

	pos = Math.ceil( pos / 4 ) * 4;

	let indices = null;

	if ( indexedGeometry ) {

		indices = copyFromBuffer(
			buffer,
			indicesType === 1 ? Uint32Array : Uint16Array,
			pos,
			indicesNumber,
			bigEndian
		);

	}

	return {
		version: version,
		attributes: attributes,
		indices: indices
	};

}

// Define the public interface

class PRWMLoader extends Loader {

	constructor( manager ) {

		super( manager );

	}

	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );

		url = url.replace( /\*/g, isBigEndianPlatform() ? 'be' : 'le' );

		loader.load( url, function ( arrayBuffer ) {

			try {

				onLoad( scope.parse( arrayBuffer ) );

			} catch ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			}

		}, onProgress, onError );

	}

	parse( arrayBuffer ) {

		const data = decodePrwm( arrayBuffer ),
			attributesKey = Object.keys( data.attributes ),
			bufferGeometry = new BufferGeometry();

		for ( let i = 0; i < attributesKey.length; i ++ ) {

			const attribute = data.attributes[ attributesKey[ i ] ];
			bufferGeometry.setAttribute( attributesKey[ i ], new BufferAttribute( attribute.values, attribute.cardinality, attribute.normalized ) );

		}

		if ( data.indices !== null ) {

			bufferGeometry.setIndex( new BufferAttribute( data.indices, 1 ) );

		}

		return bufferGeometry;

	}

	static isBigEndianPlatform() {

		return isBigEndianPlatform();

	}

}

export { PRWMLoader };
