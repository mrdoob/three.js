// Keep example selection separate from Playwright's public CLI arguments.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const argv = process.argv.slice( 2 );
const examples = [];
const env = { ...process.env };
let index = 0;

// Example names and our two flags precede Playwright options. Forward the rest
// unchanged so Playwright owns option parsing, validation and help output.
for ( ; index < argv.length; index ++ ) {

	const arg = argv[ index ];
	if ( arg === '--make' ) env.THREE_SCREENSHOTS = '1';
	else if ( arg === '--webgpu' ) env.THREE_WEBGPU = '1';
	else if ( arg.startsWith( '-' ) ) break;
	else examples.push( arg.replace( /\.html$/, '' ) );

}

env.THREE_EXAMPLES = JSON.stringify( examples );

const child = spawn( process.execPath, [ require.resolve( '@playwright/test/cli' ), 'test', '--config=test/e2e/playwright.config.js', ...argv.slice( index ) ], { stdio: 'inherit', env } );
child.on( 'error', error => {

	console.error( error );
	process.exitCode = 1;

} );
child.on( 'exit', code => {

	process.exitCode = code ?? 1;

} );
