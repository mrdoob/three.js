import { FileLoader, Loader } from 'three/webgpu';

import { MaterialXDocument } from './materialx/MaterialXDocument.js';
import { MaterialXIssueCollector } from './materialx/MaterialXWarnings.js';
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

	parse( text, options = {} ) {

		const issueCollector = new MaterialXIssueCollector( {
			issuePolicy: options.issuePolicy,
			onWarning: options.onWarning || options.warningCallback
		} );

		const document = new MaterialXDocument( this.manager, options.path || this.path, issueCollector, options.archiveResolver || null );
		const result = document.parse( text, options.materialName || null );

		issueCollector.throwIfNeeded();
		return result;

	}

}

export { MaterialXLoader };
