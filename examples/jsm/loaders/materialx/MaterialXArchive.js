import { unzipSync } from '../../libs/fflate.module.js';

const _textDecoder = new TextDecoder();

function normalizePath( path ) {

	return path
		.split( '\\' ).join( '/' )
		.replace( /^\.?\//, '' )
		.replace( /^\/+/, '' );

}

function isZipBuffer( buffer ) {

	const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array( buffer );
	return bytes.length >= 4 && bytes[ 0 ] === 0x50 && bytes[ 1 ] === 0x4b;

}

function readMtlxArchive( buffer ) {

	const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array( buffer );
	const archive = unzipSync( bytes );

	const fileMap = new Map();
	let mtlxPath = null;

	for ( const path in archive ) {

		const normalizedPath = normalizePath( path );
		fileMap.set( normalizedPath, archive[ path ] );

		if ( normalizedPath.toLowerCase().endsWith( '.mtlx' ) ) {

			if ( mtlxPath !== null ) {

				throw new Error( 'THREE.MaterialXLoader: Invalid .mtlx.zip package. Exactly one .mtlx file is required.' );

			}

			mtlxPath = normalizedPath;

		}

	}

	if ( mtlxPath === null ) {

		throw new Error( 'THREE.MaterialXLoader: Invalid .mtlx.zip package. Missing .mtlx file.' );

	}

	const text = _textDecoder.decode( fileMap.get( mtlxPath ) );
	return { text, mtlxPath, files: fileMap };

}

function createArchiveResolver( files ) {

	const objectUrlCache = new Map();

	const getFile = ( uri ) => {

		const normalized = normalizePath( decodeURI( uri ) );
		if ( files.has( normalized ) ) return files.get( normalized );

		for ( const [ path, bytes ] of files ) {

			if ( path.endsWith( normalized ) ) return bytes;

		}

		return null;

	};

	const resolve = ( uri ) => {

		if ( objectUrlCache.has( uri ) ) return objectUrlCache.get( uri );

		const bytes = getFile( uri );
		if ( ! bytes ) return null;

		const blob = new Blob( [ bytes ], { type: 'application/octet-stream' } );
		const objectUrl = URL.createObjectURL( blob );
		objectUrlCache.set( uri, objectUrl );
		return objectUrl;

	};

	const dispose = () => {

		for ( const objectUrl of objectUrlCache.values() ) {

			URL.revokeObjectURL( objectUrl );

		}

		objectUrlCache.clear();

	};

	return { resolve, dispose };

}

export { isZipBuffer, readMtlxArchive, createArchiveResolver };
