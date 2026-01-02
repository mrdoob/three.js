import http from 'http';
import https from 'https';
import path from 'path';
import os from 'os';
import { createReadStream, existsSync, statSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';

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
		let filePath = path.normalize( path.join( rootDirectory, pathname ) );

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
					.sort( ( a, b ) => {

						const aIsDir = statSync( path.join( filePath, a ) ).isDirectory();
						const bIsDir = statSync( path.join( filePath, b ) ).isDirectory();
						if ( aIsDir && ! bIsDir ) return - 1;
						if ( ! aIsDir && bIsDir ) return 1;
						return a.localeCompare( b );

					} );

				const base = pathname.endsWith( '/' ) ? pathname : pathname + '/';
				const items = files.map( file => {

					const fullPath = path.join( filePath, file );
					const isDir = statSync( fullPath ).isDirectory();
					const safeFile = escapeHtml( file );
					const safeHref = escapeHtml( base + file + ( isDir ? '/' : '' ) );
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

function getCacheDir() {

	const appName = 'three-dev-server';

	if ( process.platform === 'darwin' ) {

		return path.join( os.homedir(), 'Library', 'Application Support', appName );

	} else if ( process.platform === 'win32' ) {

		return path.join( process.env.LOCALAPPDATA || process.env.APPDATA, appName );

	} else {

		return path.join( os.homedir(), '.config', appName );

	}

}

async function getCertificate() {

	// Cache certificate in platform-specific data directory
	const cacheDir = getCacheDir();
	const certPath = path.join( cacheDir, 'cert.pem' );
	const keyPath = path.join( cacheDir, 'key.pem' );

	// Try to use cached certificate (valid for 7 days)
	try {

		const stat = statSync( certPath );
		const age = Date.now() - stat.mtimeMs;
		const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

		if ( age < maxAge ) {

			const cert = readFileSync( certPath, 'utf8' );
			const key = readFileSync( keyPath, 'utf8' );
			return { cert, key };

		}

	} catch ( e ) {

		// Cache miss or invalid, generate new certificate

	}

	// Generate new self-signed certificate using selfsigned
	let selfsigned;
	try {

		selfsigned = ( await import( 'selfsigned' ) ).default;

	} catch ( e ) {

		console.error( 'For HTTPS support, install selfsigned: npm install selfsigned' );
		process.exit( 1 );

	}

	const attrs = [ { name: 'commonName', value: 'localhost' } ];
	const pems = selfsigned.generate( attrs, {
		algorithm: 'sha256',
		days: 30,
		keySize: 2048,
		extensions: [
			{ name: 'keyUsage', keyCertSign: true, digitalSignature: true, keyEncipherment: true },
			{ name: 'subjectAltName', altNames: [
				{ type: 2, value: 'localhost' },
				{ type: 7, ip: '127.0.0.1' }
			] }
		]
	} );

	// Cache the certificate with restrictive permissions
	try {

		mkdirSync( cacheDir, { recursive: true, mode: 0o700 } );
		writeFileSync( certPath, pems.cert, { mode: 0o600 } );
		writeFileSync( keyPath, pems.private, { mode: 0o600 } );

	} catch ( e ) {

		// Caching failed, but certificate is still valid for this session

	}

	return { cert: pems.cert, key: pems.private };

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
const isMain = process.argv[ 1 ] && path.resolve( process.argv[ 1 ] ) === path.resolve( import.meta.url.replace( 'file://', '' ) );

if ( isMain ) {

	const args = process.argv.slice( 2 );
	const requestedPort = parseInt( args.find( ( _, i, arr ) => arr[ i - 1 ] === '-p' ) || '8080', 10 );
	const useSSL = args.includes( '--ssl' );
	const rootDirectory = path.resolve();

	const protocol = useSSL ? 'https' : 'http';
	const handler = createHandler( rootDirectory );

	let server;

	if ( useSSL ) {

		const credentials = await getCertificate();
		server = https.createServer( credentials, handler );

	} else {

		server = http.createServer( handler );

	}

	const port = await tryListen( server, requestedPort );

	if ( port !== requestedPort ) {

		console.log( `\x1b[33mPort ${requestedPort} in use, using ${port} instead.\x1b[0m` );

	}

	console.log( `\x1b[32mServer running at ${protocol}://localhost:${port}/\x1b[0m` );

	// Show network addresses
	const interfaces = os.networkInterfaces();
	for ( const name of Object.keys( interfaces ) ) {

		for ( const net of interfaces[ name ] ) {

			if ( net.family === 'IPv4' && ! net.internal ) {

				console.log( `  ${protocol}://${net.address}:${port}/` );

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
