import {
	DataUtils,
	FileLoader,
	Loader
} from 'three';

import { gunzipSync } from '../libs/fflate.module.js';
import { ZSTDDecoder } from '../libs/zstddec.module.js';
import { SH_BAND_COMPONENTS, SH_BAND_WORDS, SH_C0, createGaussianSplatGeometry, createPackedSphericalHarmonicsBand, writeCovariance } from '../utils/GaussianSplatUtils.js';

const SPZ_MAGIC = 0x5053474e;
const HEADER_SIZE_BYTES = 16;
const SPZ_COLOR_SCALE = SH_C0 / 0.15;
const FLAG_LOD = 0x80;
const FLAG_HAS_EXTENSIONS = 0x02;
const MAX_SUPPORTED_SH_DEGREE = 3;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15, 24 ];

let _zstd;

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

			scope.parse( buffer, onLoad, function ( e ) {

				if ( onError ) {

					onError( e );

				} else {

					console.error( e );

				}

				scope.manager.itemError( url );

			} );

		}, onProgress, onError );

	}

	/**
	 * Decompresses and parses the given `.spz` data.
	 *
	 * @param {ArrayBuffer} buffer - The raw SPZ file as an array buffer.
	 * @param {function(BufferGeometry)} [onLoad] - Executed when the parsing process has been finished.
	 * @param {onErrorCallback} [onError] - Executed when errors occur.
	 * @return {BufferGeometry|Promise<BufferGeometry>|undefined} The parsed splat geometry, or a promise for SPZ v4 data.
	 */
	parse( buffer, onLoad, onError ) {

		try {

			if ( buffer.byteLength >= 8 ) {

				const view = new DataView( buffer );
				const magic = view.getUint32( 0, true );
				const version = view.getUint32( 4, true );

				if ( magic === SPZ_MAGIC ) {

					if ( version !== 4 ) {

						throw new Error( `THREE.SPZLoader: SPZ version ${ version } is not supported.` );

					}

					const promise = getZSTDDecoder()
						.then( ( zstd ) => this.parseRawSPZV4( new Uint8Array( buffer ), zstd ) );

					if ( onLoad !== undefined ) {

						promise.then( onLoad ).catch( onError );

					}

					return promise;

				}

			}

			const decompressed = gunzipSync( new Uint8Array( buffer ) );
			const data = this.parseRawSPZ( decompressed );

			if ( onLoad !== undefined ) onLoad( data );

			return data;

		} catch ( e ) {

			if ( onError !== undefined ) {

				onError( e );
				return;

			}

			throw e;

		}

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
		const storedShDegree = view.getUint8( 12 );
		const fractionalBits = view.getUint8( 13 );
		const flags = view.getUint8( 14 );

		if ( magic !== SPZ_MAGIC ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ magic.' );

		}

		if ( version < 1 || version > 3 ) {

			throw new Error( `THREE.SPZLoader: SPZ version ${ version } is not supported.` );

		}

		if ( storedShDegree >= SH_DEGREE_TO_VECTORS.length ) {

			throw new Error( `THREE.SPZLoader: Unsupported SPZ spherical harmonics degree ${ storedShDegree }.` );

		}

		// Data beyond the supported degree is still present in the file and
		// accounted for below, it's just not decoded into an attribute.
		const shDegree = Math.min( storedShDegree, MAX_SUPPORTED_SH_DEGREE );

		const positionsSize = count * 3 * ( version === 1 ? 2 : 3 );
		const rotationsSize = count * ( version === 3 ? 4 : 3 );
		const shSize = count * SH_DEGREE_TO_VECTORS[ storedShDegree ] * 3;
		const lodSize = ( flags & FLAG_LOD ) !== 0 ? count * 6 : 0;
		const expectedSize = HEADER_SIZE_BYTES + positionsSize + count + count * 3 + count * 3 + rotationsSize + shSize + lodSize;

		if ( bytes.byteLength !== expectedSize ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ byte length.' );

		}

		let offset = HEADER_SIZE_BYTES;
		const positions = bytes.subarray( offset, offset + positionsSize );
		offset += positionsSize;
		const alphas = bytes.subarray( offset, offset + count );
		offset += count;
		const colors = bytes.subarray( offset, offset + count * 3 );
		offset += count * 3;
		const scales = bytes.subarray( offset, offset + count * 3 );
		offset += count * 3;
		const rotations = bytes.subarray( offset, offset + rotationsSize );
		offset += rotationsSize;
		const sphericalHarmonics = bytes.subarray( offset, offset + shSize );

		return parseSPZAttributes( {
			positions,
			alphas,
			colors,
			scales,
			rotations,
			sphericalHarmonics,
			count,
			version,
			fractionalBits,
			shDegree,
			storedShDegree
		} );

	}

	/**
	 * Parses raw SPZ v4 data.
	 *
	 * @param {Uint8Array} bytes - The raw SPZ v4 data.
	 * @param {ZSTDDecoder} zstd - The initialized ZSTD decoder.
	 * @return {BufferGeometry} The parsed splat geometry.
	 */
	parseRawSPZV4( bytes, zstd ) {

		const view = new DataView( bytes.buffer, bytes.byteOffset, bytes.byteLength );
		const count = view.getUint32( 8, true );
		const storedShDegree = view.getUint8( 12 );
		const shDegree = Math.min( storedShDegree, MAX_SUPPORTED_SH_DEGREE );
		const fractionalBits = view.getUint8( 13 );
		const flags = view.getUint8( 14 );
		const numStreams = view.getUint8( 15 );
		const tocByteOffset = view.getUint32( 16, true );

		if ( ( flags & FLAG_HAS_EXTENSIONS ) !== 0 ) {

			console.warn( 'THREE.SPZLoader: SPZ vendor extensions are not supported and will be skipped.' );

		}

		const positionsSize = count * 3 * 3;
		const rotationsSize = count * 4;
		const shSize = count * SH_DEGREE_TO_VECTORS[ storedShDegree ] * 3;
		const streamSizes = [ positionsSize, count, count * 3, count * 3, rotationsSize, shSize ];
		const toc = [];
		let compressedOffset = tocByteOffset + numStreams * 16;

		for ( let i = 0; i < numStreams; i ++ ) {

			const entryOffset = tocByteOffset + i * 16;
			const compressedSize = Number( view.getBigUint64( entryOffset, true ) );
			toc.push( {
				compressedOffset,
				compressedSize
			} );
			compressedOffset += compressedSize;

		}

		const streams = [];
		let streamIndex = 0;

		for ( let i = 0; i < streamSizes.length; i ++ ) {

			const streamSize = streamSizes[ i ];

			if ( streamSize === 0 ) {

				streams.push( new Uint8Array() );
				continue;

			}

			const stream = toc[ streamIndex ++ ];
			const compressed = bytes.subarray( stream.compressedOffset, stream.compressedOffset + stream.compressedSize );
			streams.push( zstd.decode( compressed, streamSize ) );

		}

		return parseSPZAttributes( {
			positions: streams[ 0 ],
			alphas: streams[ 1 ],
			colors: streams[ 2 ],
			scales: streams[ 3 ],
			rotations: streams[ 4 ],
			sphericalHarmonics: streams[ 5 ],
			count,
			version: 4,
			fractionalBits,
			shDegree,
			storedShDegree
		} );

	}

}

function getZSTDDecoder() {

	if ( _zstd === undefined ) {

		const decoder = new ZSTDDecoder();
		_zstd = decoder.init().then( () => decoder ).catch( ( e ) => {

			_zstd = undefined;
			throw e;

		} );

	}

	return _zstd;

}

function parseSPZAttributes( {
	positions,
	alphas,
	colors,
	scales,
	rotations,
	sphericalHarmonics,
	count,
	version,
	fractionalBits,
	shDegree,
	storedShDegree
} ) {

	const centers = new Float32Array( count * 3 );
	const covariances = new Float32Array( count * 6 );
	const colorBytes = new Uint8ClampedArray( count * 4 );
	const sphericalHarmonicsBands = {};

	readCenters( positions, centers, 0, count, version, fractionalBits );

	// The hot loop below avoids per-splat DataView reads by indexing into an
	// aligned Uint32Array. When the rotation section is already 4-byte aligned
	// (e.g. a freshly decoded ZSTD stream) it's read in place; otherwise it's
	// copied into a new, aligned buffer first.
	const packedRotations = version >= 3 ?
		( rotations.byteOffset % 4 === 0 ?
			new Uint32Array( rotations.buffer, rotations.byteOffset, count ) :
			new Uint32Array( rotations.buffer.slice( rotations.byteOffset, rotations.byteOffset + count * 4 ) ) ) :
		null;

	const quaternion = _quaternion;

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		const i4 = i * 4;
		const sx = SCALE_LUT[ scales[ i3 ] ];
		const sy = SCALE_LUT[ scales[ i3 + 1 ] ];
		const sz = SCALE_LUT[ scales[ i3 + 2 ] ];

		if ( version >= 3 ) {

			readSmallestThreeQuaternion( packedRotations[ i ], quaternion );

		} else {

			readXYZQuaternion( rotations, i3, quaternion );

		}

		writeCovariance( covariances, i * 6, sx, sy, sz, quaternion[ 0 ], quaternion[ 1 ], quaternion[ 2 ], quaternion[ 3 ] );

		colorBytes[ i4 ] = COLOR_LUT[ colors[ i3 ] ];
		colorBytes[ i4 + 1 ] = COLOR_LUT[ colors[ i3 + 1 ] ];
		colorBytes[ i4 + 2 ] = COLOR_LUT[ colors[ i3 + 2 ] ];
		colorBytes[ i4 + 3 ] = alphas[ i ];

	}

	readSphericalHarmonics( sphericalHarmonics, 0, count, shDegree, sphericalHarmonicsBands, storedShDegree );

	return createGaussianSplatGeometry( centers, covariances, colorBytes, sphericalHarmonicsBands );

}

function readSphericalHarmonics( bytes, offset, count, degree, sphericalHarmonics, storedDegree = degree ) {

	if ( degree === 0 ) return;

	const bands = [];

	for ( let band = 1; band <= degree; band ++ ) {

		const packed = createPackedSphericalHarmonicsBand( count, band );
		sphericalHarmonics[ `sh${ band }` ] = packed.packed;
		bands.push( {
			bytes: packed.bytes,
			components: SH_BAND_COMPONENTS[ band ],
			stride: SH_BAND_WORDS[ band ] * 4
		} );

	}

	const sourceStride = SH_DEGREE_TO_VECTORS[ storedDegree ] * 3;

	for ( let i = 0; i < count; i ++ ) {

		const sourceOffset = offset + i * sourceStride;
		let bandOffset = sourceOffset;

		for ( let bandIndex = 0; bandIndex < bands.length; bandIndex ++ ) {

			const band = bands[ bandIndex ];
			const targetOffset = i * band.stride;

			for ( let j = 0; j < band.components; j ++ ) {

				band.bytes[ targetOffset + j ] = bytes[ bandOffset ++ ];

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

		return;

	}

	const fixedScale = 1 / ( 1 << fractionalBits );

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		const rowOffset = offset + i * 9;

		centers[ i3 ] = readInt24( bytes, rowOffset ) * fixedScale;
		centers[ i3 + 1 ] = readInt24( bytes, rowOffset + 3 ) * fixedScale;
		centers[ i3 + 2 ] = readInt24( bytes, rowOffset + 6 ) * fixedScale;

	}

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
