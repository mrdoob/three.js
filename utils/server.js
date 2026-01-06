import http from 'http';
import path from 'path';
import os from 'os';
import { createReadStream, existsSync, statSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';

function escapeHtml( str ) {

	return str
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /"/g, '&quot;' );

}

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
	'.cube': 'text/plain',
	'.wasm': 'application/wasm',
	'.ktx2': 'image/ktx2'
};

function createHandler( rootDirectory ) {

	return ( req, res ) => {

		const pathname = decodeURIComponent( req.url.split( '?' )[ 0 ] );
		let filePath = path.join( rootDirectory, pathname );

		// Prevent path traversal attacks
		if ( ! filePath.startsWith( rootDirectory ) ) {

			res.writeHead( 403 );
			res.end( 'Forbidden' );
			return;

		}

		// Handle directories
		if ( existsSync( filePath ) && statSync( filePath ).isDirectory() ) {

			const indexPath = path.join( filePath, 'index.html' );

			if ( existsSync( indexPath ) ) {

				filePath = indexPath;

			} else {

				// Show directory listing
				const files = readdirSync( filePath )
					.filter( f => ! f.startsWith( '.' ) )
					.map( f => ( { name: f, isDir: statSync( path.join( filePath, f ) ).isDirectory() } ) )
					.sort( ( a, b ) => {

						if ( a.isDir && ! b.isDir ) return - 1;
						if ( ! a.isDir && b.isDir ) return 1;
						return a.name.localeCompare( b.name );

					} );

				const base = pathname.endsWith( '/' ) ? pathname : pathname + '/';
				const items = files.map( ( { name, isDir } ) => {

					const safeFile = escapeHtml( name );
					const safeHref = escapeHtml( base + name + ( isDir ? '/' : '' ) );
					const icon = isDir ? '📁' : '📄';
					return `<a href="${safeHref}"><span class="i">${icon}</span>${safeFile}</a>`;

				} ).join( '\n' );

				const safePath = escapeHtml( pathname );
				const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width">
<meta name="color-scheme" content="light dark">
<title>Index of ${safePath}</title>
<style>
body { font-family: system-ui, sans-serif; margin: 20px; }
h1 { font-weight: normal; font-size: 1.2em; margin-bottom: 10px; }
a { display: block; padding: 6px 8px; color: inherit; text-decoration: none; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
a:hover { background: rgba(128,128,128,0.2); }
.i { display: inline-block; width: 1.5em; }
</style>
</head>
<body>
<h1>Index of ${safePath}</h1>
${pathname !== '/' ? '<a href="../"><span class="i">📁</span>..</a>' : ''}
${items}
</body>
</html>`;

				res.writeHead( 200, { 'Content-Type': 'text/html' } );
				res.end( html );
				return;

			}

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

	};

}

export function createServer( options = {} ) {

	const rootDirectory = options.root || path.resolve();
	const handler = createHandler( rootDirectory );

	return http.createServer( handler );

}

function tryListen( server, port, maxAttempts = 20 ) {

	return new Promise( ( resolve, reject ) => {

		let attempts = 0;

		const onError = ( err ) => {

			if ( err.code === 'EADDRINUSE' && attempts < maxAttempts ) {

				attempts ++;
				server.listen( port + attempts );

			} else {

				reject( err );

			}

		};

		const onListening = () => {

			server.off( 'error', onError );
			resolve( server.address().port );

		};

		server.once( 'error', onError );
		server.once( 'listening', onListening );
		server.listen( port );

	} );

}

// CLI mode
const isMain = process.argv[ 1 ] && path.resolve( process.argv[ 1 ] ) === path.resolve( fileURLToPath( import.meta.url ) );

if ( isMain ) {

	const args = process.argv.slice( 2 );
	const requestedPort = parseInt( args.find( ( _, i, arr ) => arr[ i - 1 ] === '-p' ) || '8080', 10 );
	const rootDirectory = path.resolve();

	const handler = createHandler( rootDirectory );
	const server = http.createServer( handler );

	const port = await tryListen( server, requestedPort );

	if ( port !== requestedPort ) {

		console.log( `\x1b[33mPort ${requestedPort} in use, using ${port} instead.\x1b[0m` );

	}

	console.log( `\x1b[32mServer running at http://localhost:${port}/\x1b[0m` );

	// Show network addresses
	const interfaces = os.networkInterfaces();
	for ( const name of Object.keys( interfaces ) ) {

		for ( const net of interfaces[ name ] ) {

			if ( net.family === 'IPv4' && ! net.internal ) {

				console.log( `  http://${net.address}:${port}/` );

			}

		}

	}

	console.log( '\nPress Ctrl+C to stop.' );

	process.on( 'SIGINT', () => {

		console.log( '\nShutting down...' );
		server.close();
		process.exit( 0 );

	} );

}
