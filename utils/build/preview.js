import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname( fileURLToPath( import.meta.url ) );
const rootDir = path.resolve( __dirname, '../..' );

// Start rollup in watch mode
const rollup = spawn( 'npx', [
	'rollup',
	'-c', 'utils/build/rollup.config.js',
	'-w',
	'-m', 'inline'
], {
	cwd: rootDir,
	stdio: [ 'ignore', 'pipe', 'pipe' ],
	shell: true
} );

// Start server
const server = spawn( 'node', [ 'utils/server.js', '-p', '8080' ], {
	cwd: rootDir,
	stdio: [ 'ignore', 'pipe', 'pipe' ],
	shell: false
} );

// Prefix output
const prefix = ( name, color ) => {

	return ( data ) => {

		const lines = data.toString().split( '\n' ).filter( l => l.trim() );
		for ( const line of lines ) {

			console.log( `${color}[${name}]\x1b[0m ${line}` );

		}

	};

};

rollup.stdout.on( 'data', prefix( 'ROLLUP', '\x1b[44m\x1b[1m' ) );
rollup.stderr.on( 'data', prefix( 'ROLLUP', '\x1b[44m\x1b[1m' ) );
server.stdout.on( 'data', prefix( 'HTTP', '\x1b[42m\x1b[1m' ) );
server.stderr.on( 'data', prefix( 'HTTP', '\x1b[42m\x1b[1m' ) );

// Handle cleanup
const cleanup = () => {

	rollup.kill();
	server.kill();
	process.exit( 0 );

};

process.on( 'SIGINT', cleanup );
process.on( 'SIGTERM', cleanup );

rollup.on( 'close', cleanup );
server.on( 'close', cleanup );
