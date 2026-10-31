// Preserve the example-name CLI while delegating lifecycle, retries and sharding to Playwright.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const requirePlaywright = createRequire( require.resolve( '@playwright/test/package.json' ) );
const { program } = requirePlaywright( 'playwright/lib/program' );
const command = program.commands.find( command => command.name() === 'test' );
const nativeOptions = [ ...command.options ];
const args = [];
const env = { ...process.env };

// Let Playwright parse its own required, optional, variadic and short options.
// Parsing options does not execute the command's test action.
command.option( '--make', 'Generate example thumbnails' );
command.option( '--webgpu', 'Select WebGPU examples' );
const { operands: examples, unknown } = command.parseOptions( process.argv.slice( 2 ) );
if ( unknown[ 0 ] === '--help' || unknown[ 0 ] === '-h' ) command.help();
if ( unknown.length ) command.unknownOption( unknown[ 0 ] );
const options = command.opts();

if ( options.make ) env.THREE_SCREENSHOTS = '1';
if ( options.webgpu ) env.THREE_WEBGPU = '1';

for ( const option of nativeOptions ) {

	const name = option.attributeName();
	if ( command.getOptionValueSource( name ) !== 'cli' ) continue;
	args.push( option.long || option.short );
	if ( option.required || option.optional ) {

		const value = options[ name ];
		// Optional arguments without a value can be represented by true.
		if ( value !== true ) args.push( ...[].concat( value ).map( String ) );

	}

}

env.THREE_EXAMPLES = JSON.stringify( examples.map( arg => arg.replace( /\.html$/, '' ) ) );

const child = spawn( process.execPath, [ require.resolve( '@playwright/test/cli' ), 'test', '--config=test/e2e/playwright.config.js', ...args ], { stdio: 'inherit', env } );
child.on( 'error', error => {

	console.error( error );
	process.exitCode = 1;

} );
child.on( 'exit', code => {

	process.exitCode = code ?? 1;

} );
