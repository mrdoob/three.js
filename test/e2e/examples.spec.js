import { test, expect } from '@playwright/test';
import * as fs from 'node:fs/promises';
import { Image } from './image.js';
import { exceptionList, slowList } from './exceptions.js';

const exact = JSON.parse( process.env.THREE_EXAMPLES || '[]' );
const files = ( await fs.readdir( 'examples' ) )
	.filter( file => file.endsWith( '.html' ) && file !== 'index.html' )
	.map( file => file.slice( 0, - 5 ) );

// Playwright shards are contiguous runs of tests. Declare them in bit-reversed alphabetical order
// so each shard samples the whole list instead of, for example, only the slower webgpu_* examples.
const bits = Math.ceil( Math.log2( files.length ) );
const bitReverse = i => parseInt( i.toString( 2 ).padStart( bits, '0' ).split( '' ).reverse().join( '' ), 2 );
const shardOrder = files.map( ( file, i ) => [ bitReverse( i ), file ] ).sort( ( a, b ) => a[ 0 ] - b[ 0 ] ).map( entry => entry[ 1 ] );

const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );
const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );

// Workers also need the deterministic clock and random source.
const builds = new Map();

test.beforeAll( async () => {

	for ( const name of [ 'three.core.js', 'three.module.js', 'three.webgpu.js' ] ) {

		const code = await fs.readFile( `build/${ name }`, 'utf8' );
		builds.set( name, injection + '\n' + code
			.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' )
			// Preserve the legacy runner's suppression, including Inspector's later writes.
			.replace( /this\.trackTimestamp\s*=\s*\(\s*parameters\.trackTimestamp\s*===\s*true\s*\);/g, 'Object.defineProperty(this, \'trackTimestamp\', { get: () => false, set: () => {} });' ) );

	}

} );

for ( const file of shardOrder ) {

	if ( exact.length ? ! exact.includes( file ) : exceptionList.includes( file ) ) continue;
	if ( process.env.THREE_WEBGPU && ! file.startsWith( 'webgpu_' ) ) continue;

	const slow = slowList.includes( file );
	test( file, { annotation: { type: 'screenshot-readiness', description: process.env.THREE_SCREENSHOTS ? 'delayed' : slow ? 'delayed-polling' : 'polling' } }, async ( { page, context }, testInfo ) => {

		let pageError;
		const messages = [];
		page.on( 'pageerror', error => pageError = error.message );
		page.on( 'console', message => {

			messages.push( `${ message.type() }: ${ message.text() } (${ message.location().url })` );
			if ( message.type() === 'error' ) pageError = message.text();

		} );
		page.on( 'response', response => {

			if ( response.status() >= 400 ) messages.push( `HTTP ${ response.status() }: ${ response.url() }` );

		} );
		await context.addInitScript( { content: injection } );
		await context.route( '**/build/*.js', async route => {

			const name = new URL( route.request().url() ).pathname.split( '/' ).pop();
			if ( builds.has( name ) ) await route.fulfill( { contentType: 'application/javascript', body: builds.get( name ) } );
			else await route.continue();

		} );

		const client = await context.newCDPSession( page );
		// Playwright overrides Chromium's native macOS fonts in headless mode.
		// Keep visible example text identical to the legacy Puppeteer runner.
		if ( process.platform === 'darwin' ) {

			await client.send( 'Page.setFontFamilies', { fontFamilies: {
				standard: 'Times New Roman', fixed: 'Menlo', serif: 'Times New Roman', sansSerif: 'Arial'
			} } );

		}

		await client.send( 'Input.setIgnoreInputEvents', { ignore: true } );
		await page.goto( `/examples/${ file }.html`, { waitUntil: 'networkidle', timeout: 300000 } );

		await page.evaluate( cleanPage );
		// New thumbnails have no expected image to poll against, so they also get the extra wait.
		if ( slow || process.env.THREE_SCREENSHOTS ) await page.waitForTimeout( 2000 );
		await page.waitForFunction( () => window._videosReady(), null, { polling: 100, timeout: 5000 } );
		await page.evaluate( async () => {

			await new Promise( resolve => setTimeout( resolve, 0 ) );
			window._renderStarted = true;
			const start = performance._now();
			// A timeout also supports examples that render without a rAF loop.
			while ( ! window._renderFinished && performance._now() - start < 5000 ) await new Promise( resolve => setTimeout( resolve, 100 ) );

		} );

		let screenshot = ( await Image.read( await page.screenshot() ) ).scale( 0.5 );
		await testInfo.attach( 'browser-console', { body: messages.join( '\n' ), contentType: 'text/plain' } );
		expect( pageError, 'Browser errors' ).toBeUndefined();
		if ( process.env.THREE_SCREENSHOTS ) {

			await screenshot.write( `examples/screenshots/${ file }.jpg`, 95 );
			return;

		}

		const prefix = `test/e2e/output-screenshots/${ file }`;
		let expected;
		try {

			expected = await Image.read( `examples/screenshots/${ file }.jpg` );

		} catch ( error ) {

			await screenshot.write( `${ prefix }-actual.jpg`, 95 );
			throw error;

		}

		const diff = screenshot.clone();
		let different = Infinity;
		try {

			await expect.poll( async () => {

				screenshot = ( await Image.read( await page.screenshot() ) ).scale( 0.5 );
				different = expected.compare( screenshot, diff, 0.1 ) / ( screenshot.width * screenshot.height ) * 100;
				return different;

			}, { message: 'Percentage of differing pixels', timeout: 5000, intervals: [ 100, 250, 500 ] } ).toBeLessThan( 0.1 );

		} finally {

			if ( different >= 0.1 ) {

				await screenshot.write( `${ prefix }-actual.jpg`, 95 );
				await expected.write( `${ prefix }-expected.jpg`, 95 );
				await diff.write( `${ prefix }-diff.jpg`, 95 );
				for ( const kind of [ 'actual', 'expected', 'diff' ] ) await testInfo.attach( kind, { path: `${ prefix }-${ kind }.jpg`, contentType: 'image/jpeg' } );

			}

		}

		expect( pageError, 'Browser errors during screenshot polling' ).toBeUndefined();
		// A successful retry must not leave failure images for the CI report.
		await Promise.all( [ 'actual', 'expected', 'diff' ].map( kind => fs.rm( `${ prefix }-${ kind }.jpg`, { force: true } ) ) );

	} );

}
