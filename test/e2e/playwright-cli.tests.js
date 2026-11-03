import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { slowList } from './exceptions.js';

const execute = promisify( execFile );
const cwd = fileURLToPath( new URL( '../../', import.meta.url ) );

async function list( ...args ) {

	const { stdout } = await execute( process.execPath, [ 'test/e2e/playwright.js', '--list', '--reporter=json', ...args ], { cwd } );
	return JSON.parse( stdout );

}

function titles( report ) {

	return report.suites.flatMap( suite => suite.specs.map( spec => spec.title ) );

}

test( 'example operands remain exact with native option values', async () => {

	const report = await list( 'webgl_geometry_cube.html', '--trace', 'off', '--global-timeout', '12345', '--output', 'test/e2e/results/cli' );
	assert.deepEqual( titles( report ), [ 'webgl_geometry_cube' ] );
	assert.equal( report.config.globalTimeout, 12345 );
	assert.equal( report.config.projects[ 0 ].outputDir, fileURLToPath( new URL( './results/cli', import.meta.url ) ) );

} );

test( 'multiple examples and short native options preserve selection', async () => {

	const report = await list( 'webgl_geometry_cube', 'webgl_geometry_sphere', '-j2', '-g', 'geometry_', '-G', 'sphere', '--max-failures', '1', '--no-deps' );
	assert.deepEqual( titles( report ), [ 'webgl_geometry_cube' ] );
	assert.equal( report.config.workers, 2 );
	assert.equal( report.config.maxFailures, 1 );

} );

test( 'native optional arguments work with and without a value', async () => {

	const explicit = await list( 'webgl_geometry_cube', '--update-snapshots', 'none' );
	const implicit = await list( 'webgl_geometry_cube', '--update-snapshots' );
	assert.deepEqual( titles( explicit ), [ 'webgl_geometry_cube' ] );
	assert.deepEqual( titles( implicit ), [ 'webgl_geometry_cube' ] );
	assert.equal( explicit.config.updateSnapshots, 'none' );
	assert.equal( implicit.config.updateSnapshots, 'changed' );

} );

test( 'native help and argument diagnostics remain available', async () => {

	const { stdout } = await execute( process.execPath, [ 'test/e2e/playwright.js', '--help' ], { cwd } );
	assert.match( stdout, /--trace/ );
	assert.match( stdout, /--make/ );
	for ( const args of [[ '--trace' ], [ '--nonexistent-option' ]] ) {

		await assert.rejects( execute( process.execPath, [ 'test/e2e/playwright.js', ...args ], { cwd } ), error => {

			assert.equal( error.code, 1 );
			assert.match( error.stderr, /error:.*(?:argument missing|unknown option)/ );
			return true;

		} );

	}

} );

test( 'slow examples stay enabled and select legacy screenshot readiness', async () => {

	const report = await list();
	const specs = report.suites.flatMap( suite => suite.specs );
	for ( const name of slowList ) {

		const spec = specs.find( spec => spec.title === name );
		assert.ok( spec, `${ name } must still run without an explicit selection` );
		assert.ok( spec.tests[ 0 ].annotations.some( annotation => annotation.type === 'screenshot-readiness' && annotation.description === 'legacy' ) );

	}

	const fast = specs.find( spec => spec.title === 'webgl_geometry_cube' );
	assert.ok( fast.tests[ 0 ].annotations.some( annotation => annotation.type === 'screenshot-readiness' && annotation.description === 'polling' ) );
	const make = await list( 'webgl_geometry_cube', '--make' );
	assert.ok( make.suites[ 0 ].specs[ 0 ].tests[ 0 ].annotations.some( annotation => annotation.type === 'screenshot-readiness' && annotation.description === 'legacy' ) );

} );
