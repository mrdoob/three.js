// Run unit tests in headless or headful browser environment using Puppeteer.
// This allows us to run tests in an environment that closely resembles how users would experience them,
// including asset loading and browser-specific APIs,
// while still being able to automate and capture results in a CI/CD pipeline.
// It also enables us to capture console output from the browser and display it in the terminal.
// Unit testing loaders in particular benefit from running in this setup,
// as they require a server to facilitate assets loading,
// and some of them require a browser environment to run in (e.g. ImageLoader => createElementNS('img')).

import puppeteer from 'puppeteer';

const networkTimeout = 5; // 5 minutes, set to 0 to disable
const port = 1234;

let browser;

import { createServer } from '../../utils/server.js';

const server = createServer();
server.listen( port, main );


const color = code => msg => console.log( `\x1b[${code}m${msg}\x1b[39m` );
const white = color( 37 );
const red = color( 31 );
const green = color( 32 );
const yellow = color( 33 );
const blue = color( 34 );
const cyan = color( 36 );

const captureConsole = ( page ) => {

	const colors = {
		LOG: white,
		ERROR: red,
		WARN: yellow,
		INFO: green,
	};

	page.on( 'console', async ( message ) => {

		const type = message.type().toUpperCase();
		const color = colors[ type ] || blue;

		color( `${type}: ${message.text()} ` );

	} );

};


function main() {

	( async () => {

		const flags = [
			'--hide-scrollbars',
			'--enable-unsafe-webgpu',
			'--enable-features=Vulkan',
			'--disable-vulkan-surface',
			'--ignore-gpu-blocklist',
			'--disable-gpu-driver-bug-workarounds',
			'--no-sandbox'
		];

		let testPage = '';
		let testMode = '';

		let argvIndex = 2;

		if ( process.argv[ argvIndex ].startsWith( '--testPage' ) ) {

			testPage = process.argv[ argvIndex ].split( '=' )[ 1 ];
			argvIndex ++;

		}

		if ( process.argv[ argvIndex ].startsWith( '--mode' ) ) {

			testMode = process.argv[ argvIndex ].split( '=' )[ 1 ];
			argvIndex ++;

		}

		browser = await puppeteer.launch( {
			headless: testMode === 'headless',
			args: flags,
			env: { ...process.env, VK_DRIVER_FILES: '/usr/share/vulkan/icd.d/lvp_icd.x86_64.json' },
			defaultViewport: null,
			handleSIGINT: false,
			protocolTimeout: 0,
			userDataDir: './.puppeteer_profile'
		} );

		if ( testMode === 'headful' ) {

			browser.on( 'targetdestroyed', target => {

				// close the process when testing page is closed
				if ( target.type() === 'page' ) close( 0 );

			} );

		}

		const page = await browser.newPage();

		captureConsole( page );

		const testUrl = `http://localhost:${port}/test/unit/${testPage}`;

		// Load the test page
		await page.goto( testUrl, {
			waitUntil: 'networkidle0',
			timeout: networkTimeout * 60000
		} );

		// Wait for the QUnit test results
		await page.waitForFunction( () => {

			return window.QUnit && window.QUnit.done;

		} );

		// Get the test results
		const stats = await page.evaluate( () => {

			// these are set on window in the HTML test page
			return window._QUnitStats;

		} );

		white( `1..${stats.total}` );
		green( `# pass ${stats.passed}` );
		yellow( `# skip ${stats.skipped}` );
		cyan( `# todo ${stats.todo}` );
		red( `# fail ${stats.failed}` );

		// Keep the process running if testing in headful mode, otherwise close it.
		testMode === 'headless' && close( stats.failed > 0 ? 1 : 0 );

	} )();

}

process.on( 'SIGINT', () => close() );

function close( exitCode = 1 ) {

	browser.close();
	server.close();
	process.exit( exitCode );

}
