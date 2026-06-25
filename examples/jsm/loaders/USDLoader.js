import {
	FileLoader,
	Loader,
	LoaderUtils
} from 'three';

import { unzipSync } from '../libs/fflate.module.js';
import { USDAParser } from './usd/USDAParser.js';
import { USDCParser } from './usd/USDCParser.js';
import { USDComposer } from './usd/USDComposer.js';

/**
 * A loader for the USD format (USD, USDA, USDC, USDZ).
 *
 * Supports both ASCII (USDA) and binary (USDC) USD files, as well as
 * USDZ archives containing either format.
 *
 * ```js
 * const loader = new USDLoader();
 * const model = await loader.loadAsync( 'model.usdz' );
 * scene.add( model );
 * ```
 *
 * @augments Loader
 * @three_import import { USDLoader } from 'three/addons/loaders/USDLoader.js';
 */
class USDLoader extends Loader {

	/**
	 * Constructs a new USDZ loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

	}

	/**
	 * Starts loading from the given URL and passes the loaded USDZ asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Group)} onLoad - Executed when the loading process has been finished.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 */
	load( url, onLoad, onProgress, onError ) {

		const scope = this;

		const path = ( scope.path === '' ) ? LoaderUtils.extractUrlBase( url ) : scope.path;

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				scope.parse( text, path, onLoad, onError );

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
	 * Parses the given USDZ data and returns the resulting group.
	 *
	 * The returned group is created synchronously, but any referenced textures
	 * are loaded asynchronously. Provide `onLoad` to be notified once all
	 * textures have finished loading.
	 *
	 * @param {ArrayBuffer|string} buffer - The raw USDZ data as an array buffer.
	 * @param {string} [path=''] - The URL base path.
	 * @param {function(Group)} [onLoad] - Executed once the group and all of its textures are ready.
	 * @param {onErrorCallback} [onError] - Executed when errors occur.
	 * @return {Group} The parsed asset as a group.
	 */
	parse( buffer, path = '', onLoad, onError ) {

		const usda = new USDAParser();
		const usdc = new USDCParser();
		const textDecoder = new TextDecoder();

		function toArrayBuffer( data ) {

			if ( data instanceof ArrayBuffer ) return data;

			if ( data.byteOffset === 0 && data.byteLength === data.buffer.byteLength ) {

				return data.buffer;

			}

			return data.buffer.slice( data.byteOffset, data.byteOffset + data.byteLength );

		}

		function getLowercaseExtension( filename ) {

			const lastDot = filename.lastIndexOf( '.' );
			if ( lastDot < 0 ) return '';

			const lastSlash = filename.lastIndexOf( '/' );
			if ( lastSlash > lastDot ) return '';

			return filename.slice( lastDot + 1 ).toLowerCase();

		}

		function parseAssets( zip ) {

			const data = {};

			for ( const filename in zip ) {

				const fileBytes = zip[ filename ];
				const ext = getLowercaseExtension( filename );

				if ( ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'avif' ) {

					// Keep raw image bytes and create object URLs lazily in USDComposer.
					data[ filename ] = fileBytes;
					continue;

				}

				if ( ext !== 'usd' && ext !== 'usda' && ext !== 'usdc' ) continue;

				if ( isCrateFile( fileBytes ) ) {

					data[ filename ] = usdc.parseData( toArrayBuffer( fileBytes ) );

				} else {

					data[ filename ] = usda.parseData( textDecoder.decode( fileBytes ) );

				}

			}

			return data;

		}

		function isCrateFile( buffer ) {

			const crateHeader = new Uint8Array( [ 0x50, 0x58, 0x52, 0x2D, 0x55, 0x53, 0x44, 0x43 ] ); // PXR-USDC
			const view = buffer instanceof Uint8Array ? buffer : new Uint8Array( buffer );

			if ( view.byteLength < crateHeader.length ) return false;

			for ( let i = 0; i < crateHeader.length; i ++ ) {

				if ( view[ i ] !== crateHeader[ i ] ) return false;

			}

			return true;

		}

		function findUSD( zip ) {

			const fileNames = Object.keys( zip );
			if ( fileNames.length < 1 ) return { file: undefined, filename: '', basePath: '' };

			const firstFileName = fileNames[ 0 ];
			const ext = getLowercaseExtension( firstFileName );
			let isCrate = false;

			const lastSlash = firstFileName.lastIndexOf( '/' );
			const basePath = lastSlash >= 0 ? firstFileName.slice( 0, lastSlash ) : '';

			// Per AOUSD core spec v1.0.1 section 16.4.1.2, the first ZIP entry is the root layer.
			// ASCII files can end in either .usda or .usd.
			if ( ext === 'usda' ) return { file: zip[ firstFileName ], filename: firstFileName, basePath };

			if ( ext === 'usdc' ) {

				isCrate = true;

			} else if ( ext === 'usd' ) {

				// If this is not a crate file, we assume it is a plain USDA file.
				if ( ! isCrateFile( zip[ firstFileName ] ) ) {

					return { file: zip[ firstFileName ], filename: firstFileName, basePath };

				} else {

					isCrate = true;

				}

			}

			if ( isCrate ) {

				return { file: zip[ firstFileName ], filename: firstFileName, basePath };

			}

			return { file: undefined, filename: '', basePath: '' };

		}

		const scope = this;

		const finalize = ( composer, group ) => {

			if ( onLoad ) {

				Promise.all( composer.texturePromises )
					.then( () => onLoad( group ) )
					.catch( ( err ) => onError ? onError( err ) : console.error( err ) );

			}

			return group;

		};

		// USDA (standalone)

		if ( typeof buffer === 'string' ) {

			const composer = new USDComposer( scope.manager );
			const data = usda.parseData( buffer );
			return finalize( composer, composer.compose( data, {}, {}, path ) );

		}

		// USDC (standalone)

		if ( isCrateFile( buffer ) ) {

			const composer = new USDComposer( scope.manager );
			const data = usdc.parseData( toArrayBuffer( buffer ) );
			return finalize( composer, composer.compose( data, {}, {}, path ) );

		}

		const bytes = new Uint8Array( buffer );

		// USDZ

		if ( bytes[ 0 ] === 0x50 && bytes[ 1 ] === 0x4B ) {

			const zip = unzipSync( bytes );
			const assets = parseAssets( zip );
			const { file, filename, basePath } = findUSD( zip );

			if ( ! file ) {

				throw new Error( 'THREE.USDLoader: Invalid USDZ package. The first ZIP entry must be a USD layer (.usd/.usda/.usdc).' );

			}

			const composer = new USDComposer( scope.manager );
			const data = assets[ filename ];
			if ( ! data ) {

				throw new Error( 'THREE.USDLoader: Failed to parse root layer "' + filename + '".' );

			}

			return finalize( composer, composer.compose( data, assets, {}, basePath ) );

		}

		// USDA (standalone, as ArrayBuffer)

		const composer = new USDComposer( scope.manager );
		const text = textDecoder.decode( bytes );
		const data = usda.parseData( text );
		return finalize( composer, composer.compose( data, {}, {}, path ) );

	}

}

export { USDLoader };
