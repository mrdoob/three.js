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

class MaterialXLoader extends Loader {

	constructor( manager ) {

		super( manager );

		this.archiveDisposer = null;

	}

	dispose() {

		if ( this.archiveDisposer ) {

			this.archiveDisposer();
			this.archiveDisposer = null;

		}

		return this;

	}

	load( url, onLoad, onProgress, onError, options = {} ) {

		const _onError = ( e ) => {

			if ( onError ) {

				onError( e );

			} else {

				console.error( e );

			}

			this.manager.itemError( url );
			this.manager.itemEnd( url );

		};

		// Keep the LoadingManager active until parsing and dependent resources
		// have finished, matching the lifecycle used by GLTFLoader.
		this.manager.itemStart( url );

		new FileLoader( this.manager )
			.setPath( this.path )
			.setResponseType( 'arraybuffer' )
			.load( url, ( data ) => {

				try {

					const parsed = this._parseBuffer( data, url, options );

					parsed.document.waitForResources().then( () => {

						parsed.result.errors = parsed.log.errors;
						parsed.result.warnings = parsed.log.warnings;
						this._throwOnErrors( parsed.log, options );
						onLoad( parsed.result );
						this.manager.itemEnd( url );

					} ).catch( _onError );

				} catch ( e ) {

					_onError( e );

				}

			}, onProgress, _onError );

		return this;

	}

	loadAsync( url, onProgress, options = {} ) {

		if ( onProgress && typeof onProgress === 'object' ) {

			options = onProgress;
			onProgress = undefined;

		}

		return new Promise( ( resolve, reject ) => {

			this.load( url, resolve, onProgress, reject, options );

		} );

	}

	parseBuffer( data, url = '', options = {} ) {

		const parsed = this._parseBuffer( data, url, options );
		this._throwOnErrors( parsed.log, options );
		return parsed.result;

	}

	_parseBuffer( data, url = '', options = {} ) {

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

		return this._parse( text, {
			...options,
			archiveResolver,
			path: options.path || getResourcePath( this.path, url )
		} );

	}

	parse( text, options = {} ) {

		const parsed = this._parse( text, options );
		this._throwOnErrors( parsed.log, options );
		return parsed.result;

	}

	_parse( text, options = {} ) {

		const log = new MaterialXLog();

		const document = new MaterialXDocument( this.manager, options.path || this.path, log, options.archiveResolver || null, options.uvSpace );
		const result = document.parse( text, options.materialName || null, {
			interfaceValidator: options.interfaceValidator,
		} );

		return { document, log, result };

	}

	_throwOnErrors( log, options ) {

		if ( options.throwOnErrors !== false && log.errors.length > 0 ) {

			const details = log.errors.map( ( error ) => error.message ).join( ' ' );
			throw new Error( `THREE.MaterialXLoader: MaterialX translation failed with ${log.errors.length} error(s). ${details}` );

		}

	}

}

export { MaterialXLoader };
