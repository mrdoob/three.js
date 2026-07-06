import {
	BufferAttribute,
	BufferGeometry,
	DataUtils,
	FileLoader,
	Loader
} from 'three';

import { gunzipSync } from '../libs/fflate.module.js';
import { SH_C0, writeColorBytes, writeCovariance } from '../utils/GaussianSplatUtils.js';

const SPZ_MAGIC = 0x5053474e;
const HEADER_SIZE_BYTES = 16;
const MAX_SPLATS = 10000000;
const SPZ_COLOR_SCALE = SH_C0 / 0.15;
const FLAG_LOD = 0x80;
const SH_DEGREE_TO_VECTORS = [ 0, 3, 8, 15 ];

/**
 * A loader for compressed Gaussian splat `.spz` files.
 *
 * This loader decodes the format into `BufferGeometry` for use with
 * `GaussianSplatMesh`. The current renderer supports degree-0 color only, so
 * higher-order spherical harmonics are parsed only enough to skip their payload.
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

			throw new Error( `THREE.SPZLoader: Unsupported SPZ version ${ version }.` );

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
		const colors = new Uint8Array( count * 4 );
		const positionsSize = count * 3 * ( version === 1 ? 2 : 3 );
		const rotationsSize = count * ( version === 3 ? 4 : 3 );
		const shSize = count * SH_DEGREE_TO_VECTORS[ shDegree ] * 3;
		const lodSize = ( flags & FLAG_LOD ) !== 0 ? count * 6 : 0;
		const expectedSize = HEADER_SIZE_BYTES + positionsSize + count + count * 3 + count * 3 + rotationsSize + shSize + lodSize;

		if ( bytes.byteLength !== expectedSize ) {

			throw new Error( 'THREE.SPZLoader: Invalid SPZ byte length.' );

		}

		offset = readCenters( view, centers, offset, count, version, fractionalBits );

		const alphaOffset = offset;
		offset += count;

		const colorOffset = offset;
		offset += count * 3;

		const scaleOffset = offset;
		offset += count * 3;

		const rotationOffset = offset;

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			const sx = Math.exp( bytes[ scaleOffset + i3 ] / 16 - 10 );
			const sy = Math.exp( bytes[ scaleOffset + i3 + 1 ] / 16 - 10 );
			const sz = Math.exp( bytes[ scaleOffset + i3 + 2 ] / 16 - 10 );
			const rotation = version === 3 ?
				readSmallestThreeQuaternion( view, rotationOffset + i * 4 ) :
				readXYZQuaternion( bytes, rotationOffset + i * 3 );

			writeCovariance( covariances, i * 6, sx, sy, sz, rotation[ 0 ], rotation[ 1 ], rotation[ 2 ], rotation[ 3 ] );
			writeColorBytes(
				colors,
				i * 4,
				( ( bytes[ colorOffset + i3 ] / 255 - 0.5 ) * SPZ_COLOR_SCALE + 0.5 ) * 255,
				( ( bytes[ colorOffset + i3 + 1 ] / 255 - 0.5 ) * SPZ_COLOR_SCALE + 0.5 ) * 255,
				( ( bytes[ colorOffset + i3 + 2 ] / 255 - 0.5 ) * SPZ_COLOR_SCALE + 0.5 ) * 255,
				bytes[ alphaOffset + i ]
			);

		}

		const geometry = new BufferGeometry();
		geometry.setAttribute( 'position', new BufferAttribute( centers, 3 ) );
		geometry.setAttribute( 'covariance', new BufferAttribute( covariances, 6 ) );
		geometry.setAttribute( 'color', new BufferAttribute( colors, 4, true ) );
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		return geometry;

	}

}

function readCenters( view, centers, offset, count, version, fractionalBits ) {

	if ( version === 1 ) {

		for ( let i = 0; i < count; i ++ ) {

			const i3 = i * 3;
			const rowOffset = offset + i3 * 2;

			centers[ i3 ] = DataUtils.fromHalfFloat( view.getUint16( rowOffset, true ) );
			centers[ i3 + 1 ] = DataUtils.fromHalfFloat( view.getUint16( rowOffset + 2, true ) );
			centers[ i3 + 2 ] = DataUtils.fromHalfFloat( view.getUint16( rowOffset + 4, true ) );

		}

		return offset + count * 3 * 2;

	}

	const fixedScale = 1 / ( 1 << fractionalBits );

	for ( let i = 0; i < count; i ++ ) {

		const i3 = i * 3;
		const rowOffset = offset + i * 9;

		centers[ i3 ] = readInt24( view, rowOffset ) * fixedScale;
		centers[ i3 + 1 ] = readInt24( view, rowOffset + 3 ) * fixedScale;
		centers[ i3 + 2 ] = readInt24( view, rowOffset + 6 ) * fixedScale;

	}

	return offset + count * 3 * 3;

}

function readInt24( view, offset ) {

	let value = view.getUint8( offset ) | ( view.getUint8( offset + 1 ) << 8 ) | ( view.getUint8( offset + 2 ) << 16 );

	if ( ( value & 0x800000 ) !== 0 ) {

		value |= 0xff000000;

	}

	return value;

}

function readXYZQuaternion( bytes, offset ) {

	const qx = bytes[ offset ] / 127.5 - 1;
	const qy = bytes[ offset + 1 ] / 127.5 - 1;
	const qz = bytes[ offset + 2 ] / 127.5 - 1;
	const qw = Math.sqrt( Math.max( 0, 1 - qx * qx - qy * qy - qz * qz ) );

	return [ qx, qy, qz, qw ];

}

function readSmallestThreeQuaternion( view, offset ) {

	const maxValue = Math.SQRT1_2;
	const valueMask = ( 1 << 9 ) - 1;
	const quaternion = [ 0, 0, 0, 0 ];
	const packed = view.getUint32( offset, true );
	const largestIndex = packed >>> 30;
	let remainingValues = packed;
	let sumSquares = 0;

	for ( let i = 3; i >= 0; i -- ) {

		if ( i === largestIndex ) continue;

		const value = remainingValues & valueMask;
		const sign = ( remainingValues >>> 9 ) & 1;
		remainingValues >>>= 10;

		quaternion[ i ] = maxValue * ( value / valueMask );

		if ( sign !== 0 ) {

			quaternion[ i ] = - quaternion[ i ];

		}

		sumSquares += quaternion[ i ] * quaternion[ i ];

	}

	quaternion[ largestIndex ] = Math.sqrt( Math.max( 0, 1 - sumSquares ) );

	return quaternion;

}

export { SPZLoader };
