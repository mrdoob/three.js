import {
	FileLoader,
	Loader
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

		const loader = new FileLoader( scope.manager );
		loader.setPath( scope.path );
		loader.setResponseType( 'arraybuffer' );
		loader.setRequestHeader( scope.requestHeader );
		loader.setWithCredentials( scope.withCredentials );
		loader.load( url, function ( text ) {

			try {

				onLoad( scope.parse( text ) );

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
	 * @param {ArrayBuffer|string} buffer - The raw USDZ data as an array buffer.
	 * @return {Group} The parsed asset as a group.
	 */
	parse( buffer ) {

		const usda = new USDAParser();
		const usdc = new USDCParser();

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

				const ext = getLowercaseExtension( filename );
				if ( ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'avif' ) {

					const type = ext === 'png' ? 'image/png' : ext === 'avif' ? 'image/avif' : 'image/jpeg';
					const blob = new Blob( [ zip[ filename ] ], { type } );
					data[ filename ] = URL.createObjectURL( blob );

				}

			}

			for ( const filename in zip ) {

				const ext = getLowercaseExtension( filename );
				if ( ext === 'usd' || ext === 'usda' || ext === 'usdc' ) {

					if ( isCrateFile( zip[ filename ] ) ) {

						// Store parsed data (specsByPath) for on-demand composition
						const parsedData = usdc.parseData( zip[ filename ].buffer );
						data[ filename ] = parsedData;
						// Store raw buffer for re-parsing with variant selections
						data[ filename + ':buffer' ] = zip[ filename ].buffer;

					} else {

						const text = new TextDecoder().decode( zip[ filename ] );
						// Store parsed data (specsByPath) for on-demand composition
						data[ filename ] = usda.parseData( text );
						// Store raw text for re-parsing with variant selections
						data[ filename + ':text' ] = text;

					}

				}

			}

			return data;

		}

		function isCrateFile( buffer ) {

			const crateHeader = new Uint8Array( [ 0x50, 0x58, 0x52, 0x2D, 0x55, 0x53, 0x44, 0x43 ] ); // PXR-USDC

			if ( buffer.byteLength < crateHeader.length ) return false;

			const view = new Uint8Array( buffer, 0, crateHeader.length );

			for ( let i = 0; i < crateHeader.length; i ++ ) {

				if ( view[ i ] !== crateHeader[ i ] ) return false;

			}

			return true;

		}

		function findUSD( zip ) {

			const fileNames = Object.keys( zip );
			if ( fileNames.length < 1 ) return { file: undefined, basePath: '' };

			const firstFileName = fileNames[ 0 ];
			const ext = getLowercaseExtension( firstFileName );
			let isCrate = false;

			const lastSlash = firstFileName.lastIndexOf( '/' );
			const basePath = lastSlash >= 0 ? firstFileName.slice( 0, lastSlash ) : '';

			// Per AOUSD core spec v1.0.1 section 16.4.1.2, the first ZIP entry is the root layer.
			// ASCII files can end in either .usda or .usd.
			if ( ext === 'usda' ) return { file: zip[ firstFileName ], basePath };

			if ( ext === 'usdc' ) {

				isCrate = true;

			} else if ( ext === 'usd' ) {

				// If this is not a crate file, we assume it is a plain USDA file.
				if ( ! isCrateFile( zip[ firstFileName ] ) ) {

					return { file: zip[ firstFileName ], basePath };

				} else {

					isCrate = true;

				}

			}

			if ( isCrate ) {

				return { file: zip[ firstFileName ], basePath };

			}

			return { file: undefined, basePath: '' };

		}

		const scope = this;

		// USDA (standalone)

		if ( typeof buffer === 'string' ) {

			const composer = new USDComposer( scope.manager );
			const data = usda.parseData( buffer );
			return composer.compose( data, {} );

		}

		// USDC (standalone)

		if ( isCrateFile( buffer ) ) {

			const composer = new USDComposer( scope.manager );
			const data = usdc.parseData( buffer );
			return composer.compose( data, {} );

		}

		const bytes = new Uint8Array( buffer );

		// USDZ

		if ( bytes[ 0 ] === 0x50 && bytes[ 1 ] === 0x4B ) {

			const zip = unzipSync( bytes );
			const assets = parseAssets( zip );
			const { file, basePath } = findUSD( zip );

			if ( ! file ) {

				throw new Error( 'USDLoader: Invalid USDZ package. The first ZIP entry must be a USD layer (.usd/.usda/.usdc).' );

			}

			const composer = new USDComposer( scope.manager );
			let data;

			if ( isCrateFile( file ) ) {

				data = usdc.parseData( file.buffer );

			} else {

				const text = new TextDecoder().decode( file );
				data = usda.parseData( text );

			}

			return composer.compose( data, assets, {}, basePath );

		}

		// USDA (standalone, as ArrayBuffer)

		const composer = new USDComposer( scope.manager );
		const text = new TextDecoder().decode( bytes );
		const data = usda.parseData( text );
		return composer.compose( data, {} );

	}

}

export { USDLoader };
