import {
	FileLoader,
	Loader
} from 'three';

import { GaussianSplatData } from '../objects/GaussianSplatData.js';
import { writeCovariance } from './utils/GaussianSplatLoaderUtils.js';

const ROW_SIZE_BYTES = 32;

/**
 * A loader for standard fixed-width Gaussian splat `.splat` files.
 *
 * This loader decodes the format into `GaussianSplatData` for use with
 * `GaussianSplatMesh`. Each 32-byte row stores center, scale, color and
 * rotation data for one splat.
 *
 * ```js
 * const loader = new GaussianSplatLoader();
 * const data = await loader.loadAsync( './models/gsplat/example.splat' );
 * scene.add( new GaussianSplatMesh( data ) );
 * ```
 *
 * @augments Loader
 * @three_import import { GaussianSplatLoader } from 'three/addons/loaders/GaussianSplatLoader.js';
 */
class GaussianSplatLoader extends Loader {

	/**
	 * Constructs a new Gaussian splat loader.
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
	 * @param {function(GaussianSplatData)} onLoad - Executed when the loading process has been finished.
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
	 * Parses the given fixed-width `.splat` data.
	 *
	 * @param {ArrayBuffer} buffer - The raw `.splat` file as an array buffer.
	 * @return {GaussianSplatData} The parsed splat data.
	 */
	parse( buffer ) {

		if ( buffer.byteLength % ROW_SIZE_BYTES !== 0 ) {

			throw new Error( 'THREE.GaussianSplatLoader: Invalid .splat byte length.' );

		}

		const count = buffer.byteLength / ROW_SIZE_BYTES;
		const centers = new Float32Array( count * 3 );
		const covariances = new Float32Array( count * 6 );
		const colors = new Uint8Array( count * 4 );
		const view = new DataView( buffer );
		const bytes = new Uint8Array( buffer );

		for ( let i = 0; i < count; i ++ ) {

			const rowOffset = i * ROW_SIZE_BYTES;
			const i3 = i * 3;
			const i4 = i * 4;

			centers[ i3 ] = view.getFloat32( rowOffset, true );
			centers[ i3 + 1 ] = view.getFloat32( rowOffset + 4, true );
			centers[ i3 + 2 ] = view.getFloat32( rowOffset + 8, true );

			const sx = view.getFloat32( rowOffset + 12, true );
			const sy = view.getFloat32( rowOffset + 16, true );
			const sz = view.getFloat32( rowOffset + 20, true );

			colors[ i4 ] = bytes[ rowOffset + 24 ];
			colors[ i4 + 1 ] = bytes[ rowOffset + 25 ];
			colors[ i4 + 2 ] = bytes[ rowOffset + 26 ];
			colors[ i4 + 3 ] = bytes[ rowOffset + 27 ];

			// Standard .splat stores quaternion bytes as w, x, y, z.
			const qw = ( bytes[ rowOffset + 28 ] - 128 ) / 128;
			const qx = ( bytes[ rowOffset + 29 ] - 128 ) / 128;
			const qy = ( bytes[ rowOffset + 30 ] - 128 ) / 128;
			const qz = ( bytes[ rowOffset + 31 ] - 128 ) / 128;

			writeCovariance( covariances, i * 6, sx, sy, sz, qx, qy, qz, qw );

		}

		return new GaussianSplatData( { centers, covariances, colors, count } );

	}

}

export { GaussianSplatLoader };
