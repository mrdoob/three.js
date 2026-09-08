import { FileLoader, Loader } from 'three/webgpu';

import { MaterialXDocument } from './materialx/MaterialXDocument.js';
import { MaterialXLog } from './materialx/MaterialXLog.js';
import { isZipBuffer, readMtlxArchive, createArchiveResolver } from './materialx/MaterialXArchive.js';

const _textDecoder = new TextDecoder();

function getResourcePath( loaderPath, url ) {

	if ( loaderPath ) return loaderPath;

	const index = url.lastIndexOf( '/' );
	return index === - 1 ? '' : url.slice( 0, index + 1 );

}

/**
 * A loader for the MaterialX format.
 *
 * The node materials loaded with this loader can only be used with {@link WebGPURenderer}.
 * Besides plain `.mtlx` documents, the loader accepts `.mtlx.zip` archives that bundle a
 * document with its textures.
 *
 * ```js
 * const loader = new MaterialXLoader().setPath( SAMPLE_PATH );
 * const { materials } = await loader.loadAsync( 'standard_surface_brass_tiled.mtlx' );
 * ```
 *
 * @augments Loader
 * @three_import import { MaterialXLoader } from 'three/addons/loaders/MaterialXLoader.js';
 */
class MaterialXLoader extends Loader {

	/**
	 * Constructs a new MaterialX loader.
	 *
	 * @param {LoadingManager} [manager] - The loading manager.
	 */
	constructor( manager ) {

		super( manager );

		/**
		 * Releases the resources of the last loaded archive, if any.
		 *
		 * @private
		 * @type {?Function}
		 */
		this.archiveDisposer = null;

	}

	/**
	 * Frees the resources of the last loaded archive.
	 *
	 * @return {MaterialXLoader} A reference to this loader.
	 */
	dispose() {

		if ( this.archiveDisposer ) {

			this.archiveDisposer();
			this.archiveDisposer = null;

		}

		return this;

	}

	/**
	 * Starts loading from the given URL and passes the loaded MaterialX asset
	 * to the `onLoad()` callback.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {function(Object)} onLoad - Executed when the loading process has been finished. Receives the parse result, see {@link MaterialXLoader#parse}.
	 * @param {onProgressCallback} onProgress - Executed while the loading is in progress.
	 * @param {onErrorCallback} onError - Executed when errors occur.
	 * @param {Object} [options] - Parse options, see {@link MaterialXLoader#parse}.
	 * @return {MaterialXLoader} A reference to this loader.
	 */
	load( url, onLoad, onProgress, onError, options = {} ) {

		const _onError = function ( e ) {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

		};

		new FileLoader( this.manager )
			.setPath( this.path )
			.setResponseType( 'arraybuffer' )
			.load( url, ( data ) => {

				try {

					onLoad( this.parseBuffer( data, url, options ) );

				} catch ( e ) {

					_onError( e );

				}

			}, onProgress, _onError );

		return this;

	}

	/**
	 * Async version of {@link MaterialXLoader#load}. The progress callback can be
	 * omitted and the parse options passed as the second argument instead.
	 *
	 * @param {string} url - The path/URL of the file to be loaded. This can also be a data URI.
	 * @param {onProgressCallback|Object} [onProgress] - Executed while the loading is in progress, or the parse options.
	 * @param {Object} [options] - Parse options, see {@link MaterialXLoader#parse}.
	 * @return {Promise<Object>} A Promise that resolves with the parse result.
	 */
	loadAsync( url, onProgress, options = {} ) {

		if ( onProgress && typeof onProgress === 'object' ) {

			options = onProgress;
			onProgress = undefined;

		}

		return new Promise( ( resolve, reject ) => {

			this.load( url, resolve, onProgress, reject, options );

		} );

	}

	/**
	 * Parses a raw MaterialX document or a `.mtlx.zip` archive and returns the resulting materials.
	 *
	 * @param {ArrayBuffer|Uint8Array|string} data - The MaterialX document or archive.
	 * @param {string} [url=''] - The URL the data was loaded from, used to resolve relative resource paths.
	 * @param {Object} [options] - Parse options, see {@link MaterialXLoader#parse}.
	 * @return {Object} The parse result, see {@link MaterialXLoader#parse}.
	 */
	parseBuffer( data, url = '', options = {} ) {

		this.dispose();

		let text;
		let archiveResolver = null;

		if ( data && ( isZipBuffer( data ) || /\.mtlx\.zip$/i.test( url ) ) ) {

			const archive = readMtlxArchive( data );
			text = archive.text;

			const resolver = createArchiveResolver( archive.files );
			archiveResolver = resolver.resolve;
			this.archiveDisposer = resolver.dispose;

		} else if ( typeof data === 'string' ) {

			text = data;

		} else if ( data instanceof Uint8Array ) {

			text = _textDecoder.decode( data );

		} else {

			text = _textDecoder.decode( new Uint8Array( data ) );

		}

		return this.parse( text, {
			...options,
			archiveResolver,
			path: options.path || getResourcePath( this.path, url )
		} );

	}

	/**
	 * Parses the given MaterialX document and returns the resulting materials
	 * together with the translation log.
	 *
	 * @param {string} text - The raw MaterialX data as a string.
	 * @param {Object} [options] - Parse options.
	 * @param {string} [options.path] - The base path for resolving resources like textures. Defaults to the loader's path.
	 * @param {string} [options.materialName] - Only translate the material with this name. Defaults to all materials.
	 * @param {string} [options.uvSpace='bottom-left'] - The UV space of the document's textures, `'bottom-left'` or `'top-left'`.
	 * @param {Function} [options.interfaceValidator] - Validates node interfaces, see `createStrictInterfaceValidator()` in `MaterialXInterfaceValidation.js`.
	 * @param {boolean} [options.throwOnErrors=true] - Whether translation errors throw or are only reported in the log.
	 * @return {{materials: Object<string,NodeMaterial>, log: Array<Object>, errors: Array<Object>, warnings: Array<Object>}} The materials keyed by name and the translation log.
	 */
	parse( text, options = {} ) {

		const log = new MaterialXLog();

		const document = new MaterialXDocument( this.manager, options.path || this.path, log, options.archiveResolver || null, options.uvSpace );
		const result = document.parse( text, options.materialName || null, {
			interfaceValidator: options.interfaceValidator,
		} );

		if ( options.throwOnErrors !== false && log.errors.length > 0 ) {

			const details = log.errors.map( ( error ) => error.message ).join( ' ' );
			throw new Error( `THREE.MaterialXLoader: MaterialX translation failed with ${log.errors.length} error(s). ${details}` );

		}

		return result;

	}

}

export { MaterialXLoader };
