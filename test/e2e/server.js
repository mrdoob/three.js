import http from 'http';
import path from 'path';
import { createReadStream, existsSync, statSync } from 'fs';

const mimeTypes = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.mp3': 'audio/mpeg',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.ogv': 'video/ogg',
	'.ogg': 'audio/ogg',
	'.woff': 'font/woff',
	'.woff2': 'font/woff2',
	'.ttf': 'font/ttf',
	'.glb': 'model/gltf-binary',
	'.gltf': 'model/gltf+json',
	'.hdr': 'application/octet-stream',
	'.exr': 'application/octet-stream',
	'.fbx': 'application/octet-stream',
	'.bin': 'application/octet-stream',
	'.cube': 'text/plain'
};

const rootDirectory = path.resolve();

const server = http.createServer( ( req, res ) => {

	const pathname = decodeURIComponent( req.url.split( '?' )[ 0 ] );
	const filePath = path.normalize( path.join( rootDirectory, pathname ) );

	// Prevent path traversal attacks
	if ( ! filePath.startsWith( rootDirectory ) ) {

		res.writeHead( 403 );
		res.end( 'Forbidden' );
		return;

	}

	if ( ! existsSync( filePath ) ) {

		res.writeHead( 404 );
		res.end( 'File not found' );
		return;

	}

	const ext = path.extname( filePath ).toLowerCase();
	const contentType = mimeTypes[ ext ] || 'application/octet-stream';
	const stat = statSync( filePath );
	const fileSize = stat.size;
	const range = req.headers.range;

	if ( range ) {

		const parts = range.replace( /bytes=/, '' ).split( '-' );
		const start = parseInt( parts[ 0 ], 10 );
		const end = parts[ 1 ] ? parseInt( parts[ 1 ], 10 ) : fileSize - 1;

		res.writeHead( 206, {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': end - start + 1,
			'Content-Type': contentType
		} );

		createReadStream( filePath, { start, end } ).pipe( res );

	} else {

		res.writeHead( 200, {
			'Content-Length': fileSize,
			'Content-Type': contentType
		} );

		createReadStream( filePath ).pipe( res );

	}

} );

export default server;
