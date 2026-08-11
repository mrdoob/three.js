import {
	DataUtils,
	FileLoader,
	Loader
} from 'three';

import { gunzipSync } from '../libs/fflate.module.js';
import { SH_BAND_COMPONENTS, SH_C0, createGaussianSplatGeometry, writeCovariance } from '../utils/GaussianSplatUtils.js';

const SPZ_MAGIC = 0x5053474e;
const HEADER_SIZE_BYTES = 16;
const MAX_SPLATS = 10000000;
const SPZ_COLOR_SCALE = SH_C0 / 0.15;
const FLAG_LOD = 0x80;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15 ];

// Scales and colors are stored as single bytes, so all 256 possible outputs
// of their decode functions can be precomputed once.
const SCALE_LUT = new Float32Array( 256 );
const COLOR_LUT = new Uint8ClampedArray( 256 );

for ( let i = 0; i < 256; i ++ ) {

	SCALE_LUT[ i ] = Math.exp( i / 16 - 10 );
	COLOR_LUT[ i ] = ( ( i / 255 - 0.5 ) * SPZ_COLOR_SCALE + 0.5 ) * 255;

}

// Quaternion components are 10-bit sign-magnitude values (bit 9 is the sign,
// bits 0-8 are the magnitude scaled to [0, 1/sqrt(2)]), so all 1024 possible
// decoded values can be precomputed, avoiding an unpredictable sign branch in
// the hot loop.
const QUAT_COMPONENT_LUT = new Float64Array( 1024 );

for ( let i = 0; i < 1024; i ++ ) {

	const value = Math.SQRT1_2 * ( ( i & 511 ) / 511 );
	QUAT_COMPONENT_LUT[ i ] = ( i & 512 ) !== 0 ? - value : value;

}

const _quaternion = [ 0, 0, 0, 0 ];

/**
 * A loader for compressed Gaussian splat `.spz` files.
 *
 * This loader decodes the format into `BufferGeometry` for use with
 * `GaussianSplatMesh`. Higher-order spherical harmonics are exposed as optional
 * `sphericalHarmonics1` through `sphericalHarmonics3` packed uint32 geometry
 * attributes (`SH_BAND_WORDS[ degree ]` words per splat). Coefficients use the
 * clamped-byte encoding `( value - 128 ) / 128`, four bytes per word.
 *
 * ```js
 * const loader = new SPZLoader();
 * const data = await loader.loadAsync( './models/gsplat/example.spz' );
 * scene.add( new GaussianSplatMesh( data ) );
 * ```
 *
 * @augments Loader
 * @three_import import { SPZLoader } from 'three/addons/loaders/SPZLoader.js';
 */
class SPZLoader extends Loader {

	/**
	 * Constructs a new Gaussian splat SPZ loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded splat data to
	 * the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(BufferGeometry)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const loader = new FileLoader( this.manager );
		loader.setPath( this.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( this.requestHeader );
		loader.setWithCredentials( this.withCredentials );
		loader.load( url, function ( buffer ) {

			try {

				onLoad( scope.parse( buffer ) );

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

	/**
	 * Decompresses and parses the given `.spz` data.
	 *
	 * @param {ArrayBuffer} buffer - The raw gzip-compressed SPZ file as an array buffer.
	 * @return {BufferGeometry} The parsed splat geometry.
	 */
	parse( buffer ) {

		if ( buffer.byteLength >= 8 ) {

			const view = new DataView( buffer );

			if ( view.getUint32( 0, true ) === SPZ_MAGIC && view.getUint32( 4, true ) >= 4 ) {

				throw new Error( `THREE.SPZLoader: SPZ version ${ view.getUint32( 4, true ) } is not supported.` );

			}

		}

		const decompressed = gunzipSync( new Uint8Array( buffer ) );

		return this.parseRawSPZ( decompressed );

	}

	/**
	 * Parses raw SPZ data after gzip decompression.
	 *
	 * @param {Uint8Array} bytes - The decompressed SPZ data.
	 * @return {BufferGeometry} The parsed splat geometry.
	 */
	parseRawSPZ( bytes ) {

		if ( bytes.byteLength < HEADER_SIZE_BYTES ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ header.' );

		}

		const view = new DataView( bytes.buffer, bytes.byteOffset, bytes.byteLength );
		const magic = view.getUint32( 0, true );
		const version = view.getUint32( 4, true );
		const count = view.getUint32( 8, true );
		const shDegree = view.getUint8( 12 );
		const fractionalBits = view.getUint8( 13 );
		const flags = view.getUint8( 14 );

		if ( magic !== SPZ_MAGIC ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ magic.' );

		}

		if ( version < 1 || version > 3 ) {

			throw new Error( `THREE.SPZLoader: SPZ version ${ version } is not supported.` );

		}

		if ( count > MAX_SPLATS ) {

			throw new Error( `THREE.SPZLoader: SPZ file contains too many splats (${ count }).` );

		}

		if ( shDegree > 3 ) {

			throw new Error( `THREE.SPZLoader: Unsupported SPZ spherical harmonics degree ${ shDegree }.` );

		}

		let offset = HEADER_SIZE_BYTES;
		const centers = new Float32Array( count * 3 );
		const covariances = new Float32Array( count * 6 );
		const colors = new Uint8ClampedArray( count * 4 );
		const sphericalHarmonics = {};
		const positionsSize = count * 3 * ( version === 1 ? 2 : 3 );
		const rotationsSize = count * ( version === 3 ? 4 : 3 );
		const shSize = count * SH_DEGREE_TO_VECTORS[ shDegree ] * 3;
		const lodSize = ( flags & FLAG_LOD ) !== 0 ? count * 6 : 0;
		const expectedSize = HEADER_SIZE_BYTES + positionsSize + count + count * 3 + count * 3 + rotationsSize + shSize + lodSize;

		if ( bytes.byteLength !== expectedSize ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ byte length.' );

		}

		offset = readCenters( bytes, centers, offset, count, version, fractionalBits );

		const alphaOffset = offset;
		offset += count;

		const colorOffset = offset;
		offset += count * 3;

		const scaleOffset = offset;
		offset += count * 3;

		const rotationOffset = offset;
		const sphericalHarmonicsOffset = rotationOffset + rotationsSize;

		// Copy the rotation section into an aligned Uint32Array so the hot loop
		// avoids per-splat DataView reads (the section offset within the file is
		// not guaranteed to be 4-byte aligned).
		const packedRotations = version === 3 ?
			new Uint32Array( bytes.buffer.slice( bytes.byteOffset + rotationOffset, bytes.byteOffset + rotationOffset + count * 4 ) ) :
			null;

		const quaternion = _quaternion;

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			const i4 = i * 4;
			const sx = SCALE_LUT[ bytes[ scaleOffset + i3 ] ];
			const sy = SCALE_LUT[ bytes[ scaleOffset + i3 + 1 ] ];
			const sz = SCALE_LUT[ bytes[ scaleOffset + i3 + 2 ] ];

			if ( version === 3 ) {

				readSmallestThreeQuaternion( packedRotations[ i ], quaternion );

			} else {

				readXYZQuaternion( bytes, rotationOffset + i3, quaternion );

			}

			writeCovariance( covariances, i * 6, sx, sy, sz, quaternion[ 0 ], quaternion[ 1 ], quaternion[ 2 ], quaternion[ 3 ] );

			colors[ i4 ] = COLOR_LUT[ bytes[ colorOffset + i3 ] ];
			colors[ i4 + 1 ] = COLOR_LUT[ bytes[ colorOffset + i3 + 1 ] ];
			colors[ i4 + 2 ] = COLOR_LUT[ bytes[ colorOffset + i3 + 2 ] ];
			colors[ i4 + 3 ] = bytes[ alphaOffset + i ];

		}

		readSphericalHarmonics( bytes, sphericalHarmonicsOffset, count, shDegree, sphericalHarmonics );

		return createGaussianSplatGeometry( centers, covariances, colors, sphericalHarmonics );

	}

}

function readSphericalHarmonics( bytes, offset, count, degree, sphericalHarmonics ) {

	if ( degree === 0 ) return;

	if ( degree >= 1 ) sphericalHarmonics.sh1 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 1 ] );
	if ( degree >= 2 ) sphericalHarmonics.sh2 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 2 ] );
	if ( degree >= 3 ) sphericalHarmonics.sh3 = new Uint8ClampedArray( count * SH_BAND_COMPONENTS[ 3 ] );

	for ( let i = 0; i < count; i ++ ) {

		const sh1Offset = i * SH_BAND_COMPONENTS[ 1 ];

		for ( let j = 0; j < SH_BAND_COMPONENTS[ 1 ]; j ++ ) {

			sphericalHarmonics.sh1[ sh1Offset + j ] = bytes[ offset ++ ];

		}

		if ( sphericalHarmonics.sh2 !== undefined ) {

			const sh2Offset = i * SH_BAND_COMPONENTS[ 2 ];

			for ( let j = 0; j < SH_BAND_COMPONENTS[ 2 ]; j ++ ) {

				sphericalHarmonics.sh2[ sh2Offset + j ] = bytes[ offset ++ ];

			}

		}

		if ( sphericalHarmonics.sh3 !== undefined ) {

			const sh3Offset = i * SH_BAND_COMPONENTS[ 3 ];

			for ( let j = 0; j < SH_BAND_COMPONENTS[ 3 ]; j ++ ) {

				sphericalHarmonics.sh3[ sh3Offset + j ] = bytes[ offset ++ ];

			}

		}

	}

}

function readCenters( bytes, centers, offset, count, version, fractionalBits ) {

	if ( version === 1 ) {

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			const rowOffset = offset + i3 * 2;

			centers[ i3 ] = DataUtils.fromHalfFloat( bytes[ rowOffset ] | ( bytes[ rowOffset + 1 ] << 8 ) );
			centers[ i3 + 1 ] = DataUtils.fromHalfFloat( bytes[ rowOffset + 2 ] | ( bytes[ rowOffset + 3 ] << 8 ) );
			centers[ i3 + 2 ] = DataUtils.fromHalfFloat( bytes[ rowOffset + 4 ] | ( bytes[ rowOffset + 5 ] << 8 ) );

		}

		return offset + count * 3 * 2;

	}

	const fixedScale = 1 / ( 1 << fractionalBits );

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		const rowOffset = offset + i * 9;

		centers[ i3 ] = readInt24( bytes, rowOffset ) * fixedScale;
		centers[ i3 + 1 ] = readInt24( bytes, rowOffset + 3 ) * fixedScale;
		centers[ i3 + 2 ] = readInt24( bytes, rowOffset + 6 ) * fixedScale;

	}

	return offset + count * 3 * 3;

}

function readInt24( bytes, offset ) {

	// The left shift by 8 followed by an arithmetic right shift sign-extends
	// the 24-bit value.
	return ( ( bytes[ offset ] << 8 ) | ( bytes[ offset + 1 ] << 16 ) | ( bytes[ offset + 2 ] << 24 ) ) >> 8;

}

function readXYZQuaternion( bytes, offset, target ) {

	const qx = bytes[ offset ] / 127.5 - 1;
	const qy = bytes[ offset + 1 ] / 127.5 - 1;
	const qz = bytes[ offset + 2 ] / 127.5 - 1;

	target[ 0 ] = qx;
	target[ 1 ] = qy;
	target[ 2 ] = qz;
	target[ 3 ] = Math.sqrt( Math.max( 0, 1 - qx * qx - qy * qy - qz * qz ) );

}

function readSmallestThreeQuaternion( packed, target ) {

	const largestIndex = packed >>> 30;

	// The three smallest components are packed from the lowest bits upward,
	// filling the non-largest indices in descending order: the low 10 bits go
	// to the highest remaining index, the top 10 bits to the lowest.
	const a = QUAT_COMPONENT_LUT[ packed & 1023 ];
	const b = QUAT_COMPONENT_LUT[ ( packed >>> 10 ) & 1023 ];
	const c = QUAT_COMPONENT_LUT[ ( packed >>> 20 ) & 1023 ];

	switch ( largestIndex ) {

		case 0:
			target[ 1 ] = c; target[ 2 ] = b; target[ 3 ] = a;
			break;
		case 1:
			target[ 0 ] = c; target[ 2 ] = b; target[ 3 ] = a;
			break;
		case 2:
			target[ 0 ] = c; target[ 1 ] = b; target[ 3 ] = a;
			break;
		default:
			target[ 0 ] = c; target[ 1 ] = b; target[ 2 ] = a;
			break;

	}

	target[ largestIndex ] = Math.sqrt( Math.max( 0, 1 - ( a * a + b * b + c * c ) ) );

}

export { SPZLoader };
