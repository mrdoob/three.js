//
// Description:
//
//  Create a static file server. If dev mode enabled, it will redirect routes
//  from /build to /src, except for those with `?browse` which are always
//  served as-is.
//
// CLI Options:
//
// --ssl      : Enable SSL
// --internal : Enable listening on loopback interfaces only
// --port=    : Set port
// --dev      : Enable dev mode
//
// Examples:
//
// A dev server on https://127.0.0.1:3333:
// > server.js --ssl --port=3333 --dev
//
// A static file server on https://127.0.0.1:8080:
// > server.js --ssl --port=8080
//

import http from 'node:http';
import https from 'node:https';
import { createCA, createCert } from 'mkcert';
import { join, extname, relative, basename } from 'node:path';
import { argv, cwd } from 'node:process';
import { existsSync, createReadStream, writeFileSync, readFileSync, statSync, readdirSync, rmSync } from 'node:fs';
import { styleText, parseArgs } from 'node:util';
import { networkInterfaces } from 'node:os';

//
// Configure
//

const DEFAULT_PORT = 8080;
const DEFAULT_INDEX = 'index.html';
const DEFAULT_MIME = 'application/octet-stream';
const DEFAULT_CERTIFICATE_VALIDITY = 365; // in days

//
// Define MIME Types
//

const MIMES = {
	'html': 'text/html',
	'css': 'text/css',
	'js': 'text/javascript',
	'json': 'application/json',
	'ico': 'image/x-icon',
	'svg': 'image/svg+xml',
	'jpg': 'image/jpeg',
	'png': 'image/png',
	'avif': 'image/avif',
	'woff2': 'font/woff2',
	'otf': 'font/otf',
	'ttf': 'application/x-font-ttf',
	'gltf': 'model/gltf',
	'glb': 'model/gltf-binary',
};

//
// Define Routes
//

const ROUTES = [ {
	pattern: /^\/build\/three\.module\.js$/i,
	redirect: () => '/src/Three.js',
	dev_only: true,
}, {
	pattern: /^\/build\//i,
	redirect: ( pathname, pattern ) => pathname.replace( pattern, '/src/' ),
	dev_only: true,
} ];

//
// CLI Arguments
//

const ARGS = parseArgs( {
	options: {
		ssl: { type: 'boolean' },
		internal: { type: 'boolean' },
		port: { type: 'string' },
		dev: { type: 'boolean' }
	},
	args: argv.slice( 2 ),
} ).values;

// ----
// Main
// ----

const server = await create_server();
const port = ARGS.port !== undefined ? parseInt( ARGS.port ) : DEFAULT_PORT;
const hostname = ARGS.internal ? '127.0.0.1' : '';
server.listen( port, hostname, () => {

	print_row( 'Serve Mode', ARGS.dev ? 'Dev' : 'Preview' );

	const protocol = ARGS.ssl ? 'https:' : 'http:';
	const entries = [];

	for ( const infos of Object.values( networkInterfaces() ) ) {

		for ( const info of infos ) {

			if ( ARGS.internal && ! info.internal ) continue;

			if ( info.family === 'IPv4' ) entries.push( `${protocol}//${info.address}:${port}` );

		}

	}

	print_row( 'Listening', entries.join( ' , ' ) );
	print_sep();

} );

//
// Create HTTP(s) Server
//

async function create_server() {

	if ( ! ARGS.ssl ) return http.createServer( on_request );

	const key_path = join( import.meta.dirname, 'server.key' );
	const crt_path = join( import.meta.dirname, 'server.crt' );

	if ( ! is_certificate_valid( key_path, crt_path ) ) {

		const { key, cert } = await createCert( {
			ca: await createCA( {
				organization: 'a',
				countryCode: 'a',
				state: 'a',
				locality: 'a',
				validity: DEFAULT_CERTIFICATE_VALIDITY,
			} ),
			validity: DEFAULT_CERTIFICATE_VALIDITY,
			domains: [ 'a' ]
		} );

		rmSync( key_path, { force: true } );
		rmSync( crt_path, { force: true } );

		writeFileSync( key_path, key, { encoding: 'utf-8' } );
		writeFileSync( crt_path, cert, { encoding: 'utf-8' } );

	}

	const key_relpath = relative( cwd(), key_path );
	const crt_relpath = relative( cwd(), crt_path );
	print_row( 'Certificate', `${key_relpath} ${crt_relpath}` );

	return https.createServer( {
		key: readFileSync( key_path, { encoding: 'utf-8' } ),
		cert: readFileSync( crt_path, { encoding: 'utf-8' } )
	}, on_request );

}

//
// Handle HTTP Requests
//

function on_request( req, res ) {

	const url = new URL( req.url, 'http://localhost' );

	// method not allowed

	if ( req.method !== 'GET' ) {

		res.writeHead( 405 ).end();
		return print_405( req.method, url.pathname );

	}

	// routing

	for ( const { pattern, redirect, dev_only } of ROUTES ) {

		if ( dev_only && ! ARGS.dev ) continue;

		if ( url.searchParams.has( 'browse' ) ) continue;

		if ( pattern.test( url.pathname ) ) {

			const location = redirect( url.pathname, pattern );
			res.writeHead( 307, { 'Location': location } ).end();
			return print_307( url.pathname, location );

		}

	}

	// not found

	const filepath = join( cwd(), url.pathname );
	if ( ! existsSync( filepath ) ) {

		res.writeHead( 404 ).end();
		return print_404( url.pathname );

	}

	// render directory

	if ( statSync( filepath ).isDirectory() ) {

		if ( url.pathname.endsWith( '/' ) ) {

			res.writeHead( 200, { 'Content-Type': 'text/html' } ).end( render_directory( filepath ) );
			return print_200( url.pathname );

		} else {

			const location = url.pathname + '/';
			res.writeHead( 307, { 'Location': location } ).end();
			return print_307( url.pathname, location );

		}

	}

	// ok

	res.writeHead( 200, {
		'Content-Type': MIMES[ extname( filepath ).substring( 1 ) ] || DEFAULT_MIME,
		'Cache-Control': 'no-cache,no-store'
	} );
	createReadStream( filepath ).pipe( res );
	return print_200( url.pathname );

}

//
// Validate Certificate
//

function is_certificate_valid( key_path, crt_path ) {

	// invalidate if key/crt not exist
	if ( ! existsSync( key_path ) || ! existsSync( crt_path ) ) return false;

	const key_age = ( new Date() - statSync( key_path ).birthtime ) / 86400000; // in days
	const crt_age = ( new Date() - statSync( crt_path ).birthtime ) / 86400000;

	// invalidate if ages < 0, caused by system clock error for example
	if ( key_age < 0 || crt_age < 0 ) return false;

	// invalidate if ages expire soon, e.g. 1 day before expiration
	const max_age = DEFAULT_CERTIFICATE_VALIDITY - 1;
	if ( key_age >= max_age || crt_age >= max_age ) return false;

	return true;

}

//
// Render Directory
//

function render_directory( filepath ) {

	const dirs = [];
	const files = [];
	const index = [];

	for ( const entry of readdirSync( filepath ) ) {

		const stat = statSync( join( filepath, entry ) );

		if ( entry === DEFAULT_INDEX ) index.push( entry );
		else if ( stat.isFile() ) files.push( entry );
		else if ( stat.isDirectory() ) dirs.push( entry );

	}

	return `<!doctype html>
<style>* { line-height: 1.4 } a:not(:hover) { text-decoration: none } li { list-style-type: none }</style>
<a href="..?browse">..</a><br>
<ul>${ index.map( entry => `<li><a href='./${ entry }?browse'>${ basename( entry ) }</a></li>` ).join( '' ) }</ul>
<ul>${ dirs.map( entry => `<li><a href='./${ entry }/?browse'>${ basename( entry ) }/</a></li>` ).join( '' ) }</ul>
<ul>${ files.map( entry => `<li><a href='./${ entry }?browse'>${ basename( entry ) }</a></li>` ).join( '' ) }</ul>
`;

}

//
// Utils - Debug Printers
//

function print_200( pathname ) {

	console.debug( styleText( [ 'bold' ], 'HTTP 200' ), pathname );

}

function print_307( pathname, location ) {

	console.debug( styleText( [ 'cyan', 'bgBlack' ], `HTTP 307 ${ pathname } >>> ${ location }` ) );

}

function print_404( pathname ) {

	console.debug( styleText( [ 'red', 'bgBlack' ], `HTTP 404 ${ pathname }` ) );

}

function print_405( method, pathname ) {

	console.debug( styleText( [ 'red', 'bgBlack' ], `HTTP 405 ${ method } ${ pathname }` ) );

}

function print_row( label, msg ) {

	console.debug( styleText( [ 'bold' ], label.padEnd( 12 ) ), msg );

}

function print_sep() {

	console.debug( '\n' );

}
