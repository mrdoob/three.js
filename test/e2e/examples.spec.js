import { test as base, expect } from '@playwright/test';
import * as fs from 'node:fs/promises';
import { Image } from './image.js';
import { exceptionList } from './exceptions.js';
import { gotoWithLegacyNetworkIdle, waitForLegacyNetworkIdle, renderOnce } from './legacy-readiness.js';

const exact = JSON.parse( process.env.THREE_EXAMPLES || '[]' );
const files = ( await fs.readdir( 'examples' ) )
	.filter( file => file.endsWith( '.html' ) && file !== 'index.html' )
	.map( file => file.slice( 0, - 5 ) );

const injection = await fs.readFile( 'test/e2e/deterministic-injection.js', 'utf8' );
const cleanPage = await fs.readFile( 'test/e2e/clean-page.js', 'utf8' );

// Like the legacy runner, each worker reuses one page across examples. A failed
// test still replaces the worker, so retries start with a fresh browser.
const test = base.extend( {

	shared: [ async ( { browser }, use, workerInfo ) => {

		const { viewport, baseURL } = workerInfo.project.use;
		const context = await browser.newContext( { viewport, baseURL } );

		// Workers also need the deterministic clock and random source.
		const builds = new Map();
		for ( const name of [ 'three.core.js', 'three.module.js', 'three.webgpu.js' ] ) {

			const code = await fs.readFile( `build/${ name }`, 'utf8' );
			builds.set( name, injection + '\n' + code
				.replace( /Math\.random\(\) \* 0xffffffff/g, 'Math._random() * 0xffffffff' )
				// Preserve the legacy runner's suppression, including Inspector's later writes.
				.replace( /this\.trackTimestamp\s*=\s*\(\s*parameters\.trackTimestamp\s*===\s*true\s*\);/g, 'Object.defineProperty(this, \'trackTimestamp\', { get: () => false, set: () => {} });' ) );

		}

		await context.addInitScript( { content: injection } );
		await context.route( '**/build/*.js', async route => {

			const name = new URL( route.request().url() ).pathname.split( '/' ).pop();
			if ( builds.has( name ) ) await route.fulfill( { contentType: 'application/javascript', body: builds.get( name ) } );
			else await route.continue();

		} );

		const page = await context.newPage();
		const client = await context.newCDPSession( page );
		// Playwright overrides Chromium's native macOS fonts in headless mode.
		// Keep visible example text identical to the legacy Puppeteer runner.
		if ( process.platform === 'darwin' ) {

			await client.send( 'Page.setFontFamilies', { fontFamilies: {
				standard: 'Times New Roman', fixed: 'Menlo', serif: 'Times New Roman', sansSerif: 'Arial'
			} } );

		}

		await client.send( 'Input.setIgnoreInputEvents', { ignore: true } );
		await use( { page, client } );
		await context.close();

	}, { scope: 'worker' } ]

} );

for ( const file of files ) {

	if ( exact.length ? ! exact.includes( file ) : exceptionList.includes( file ) ) continue;
	if ( process.env.THREE_WEBGPU && ! file.startsWith( 'webgpu_' ) ) continue;

	test( file, async ( { shared: { page, client } }, testInfo ) => {

		// Listeners belong to this example only; the page outlives it.
		const listeners = [];
		const on = ( event, listener ) => {

			listeners.push( [ event, listener ] );
			page.on( event, listener );

		};

		try {

			await checkExample( file, page, client, on, testInfo );

		} finally {

			for ( const [ event, listener ] of listeners ) page.off( event, listener );

		}

	} );

}

async function checkExample( file, page, client, on, testInfo ) {

	// A screenshot from a software renderer cannot verify hardware rendering.
	// THREE_SOFTWARE_GPU opts in for GPU-less CI, whose thumbnails come from Mesa lavapipe.
	const allowSoftware = !! process.env.THREE_SOFTWARE_GPU;
	await page.goto( '/test/e2e/gpu-probe.html' );
	const renderer = await page.evaluate( async ( { webgpu, allowSoftware } ) => {

		const canvas = document.createElement( 'canvas' );
		const gl = canvas.getContext( 'webgl2' );
		if ( ! gl ) throw new Error( 'Hardware WebGL2 context unavailable' );
		const debug = gl.getExtension( 'WEBGL_debug_renderer_info' );
		if ( ! debug ) throw new Error( 'Cannot verify the WebGL renderer' );
		const name = gl.getParameter( debug.UNMASKED_RENDERER_WEBGL );
		gl.getExtension( 'WEBGL_lose_context' )?.loseContext();
		if ( webgpu ) {

			const adapter = await navigator.gpu?.requestAdapter();
			if ( ! adapter || ( ! allowSoftware && ( adapter.info?.isFallbackAdapter || adapter.isFallbackAdapter ) ) ) throw new Error( 'Hardware WebGPU adapter unavailable' );
			const device = await adapter.requestDevice();
			device.destroy();
			const info = adapter.info;
			return name + ' ' + JSON.stringify( { vendor: info?.vendor, architecture: info?.architecture, device: info?.device, description: info?.description } );

		}

		return name;

	}, { webgpu: file.startsWith( 'webgpu_' ), allowSoftware } );
	if ( ! allowSoftware ) expect( renderer, 'A physical GPU is required' ).not.toMatch( /swiftshader|llvmpipe|lavapipe|software|microsoft basic render/i );
	await testInfo.attach( 'gpu', { body: renderer, contentType: 'text/plain' } );

	let pageError;
	const messages = [];
	const pendingRequests = new Set();
	on( 'request', request => {

		pendingRequests.add( request );

	} );
	const finishRequest = request => {

		pendingRequests.delete( request );

	};

	on( 'requestfinished', finishRequest );
	on( 'requestfailed', finishRequest );
	on( 'pageerror', error => pageError = error.message );
	on( 'console', message => {

		messages.push( `${ message.type() }: ${ message.text() } (${ message.location().url })` );
		if ( message.type() === 'error' ) pageError = message.text();

	} );
	on( 'response', response => {

		if ( response.status() >= 400 ) messages.push( `HTTP ${ response.status() }: ${ response.url() }` );

	} );
	await gotoWithLegacyNetworkIdle( page, client, `/examples/${ file }.html` );
	await page.evaluate( cleanPage );
	await waitForLegacyNetworkIdle( page, pendingRequests );
	await page.waitForFunction( () => window._videosReady(), null, { polling: 100, timeout: 5000 } );
	await renderOnce( page );

	const screenshot = ( await Image.read( await page.screenshot() ) ).scale( 0.5 );
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

		different = expected.compare( screenshot, diff, 0.1 ) / ( screenshot.width * screenshot.height ) * 100;

	} finally {

		if ( different >= 0.1 ) {

			await screenshot.write( `${ prefix }-actual.jpg`, 95 );
			await expected.write( `${ prefix }-expected.jpg`, 95 );
			await diff.write( `${ prefix }-diff.jpg`, 95 );
			for ( const kind of [ 'actual', 'expected', 'diff' ] ) await testInfo.attach( kind, { path: `${ prefix }-${ kind }.jpg`, contentType: 'image/jpeg' } );

		}

	}

	expect( different, 'Percentage of differing pixels' ).toBeLessThan( 0.1 );
	// A successful retry must not leave failure images for the CI report.
	await Promise.all( [ 'actual', 'expected', 'diff' ].map( kind => fs.rm( `${ prefix }-${ kind }.jpg`, { force: true } ) ) );

}
