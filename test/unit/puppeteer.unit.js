// Purpose: Run QUnit tests in headless browser and serving assets through express,
// allowing to unit-test loaders in particular, as they require a server to facilitate assets loading,
// and some of them require a browser environment to run in (e.g. ImageLoader => createElementNS('img')).

import puppeteer from 'puppeteer';
import express from 'express';
import chalk from 'chalk';
import path from 'path';

const networkTimeout = 5; // 5 minutes, set to 0 to disable
const port = 1234;
const width = 400;
const height = 250;
const viewScale = 2;
const viewport = { width: width * viewScale, height: height * viewScale };

let browser;

const app = express();
app.use( express.static( path.resolve() ) );
const server = app.listen( port, main );

// allows consoles from browser to be captured and displayed in CLI
// https://stackoverflow.com/questions/51676159/puppeteer-console-log-how-to-look-inside-jshandleobject
export const captureConsole = ( page ) => {

	// make args accessible
	const describe = ( jsHandle ) => {

		return jsHandle.evaluate( ( obj ) => {

			// serialize |obj| however you want
			return `OBJ: ${typeof obj}, ${obj}`;

		}, jsHandle );

	};

	const colors = {
		LOG: chalk.white,
		ERR: chalk.red,
		WAR: chalk.yellow,
		INF: chalk.cyan,
	};

	page.on( 'console', async ( message ) => {

		const args = await Promise.all( ( message.args() ).map( async arg => describe( arg ) ) );
		const type = message.type().substring( 0, 3 ).toUpperCase();
		const color = colors[ type ] || chalk.blue;
		let text = '';

		for ( let i = 0; i < args.length; ++ i ) {

			text += `[${i}] ${args[ i ]} `;

		}

		console.log( color( `CONSOLE.${type}: ${message.text()}\n${text} ` ) );

	} );

};


function main() {

	( async () => {

		const flags = [ '--hide-scrollbars', '--enable-gpu' ];
		// '--enable-chrome-browser-cloud-management'

		const testPage = process.env.TEST_PAGE;
		const testMode = process.env.VISIBLE ? 'headful' : 'headless';

		browser = await puppeteer.launch( {
			headless: testMode === 'headful' ? false : 'new',
			args: flags,
			defaultViewport: viewport,
			handleSIGINT: false,
			protocolTimeout: 0
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

		console.log( `1..${stats.total}` );
		console.log( `# pass ${stats.passed}` );
		console.log( chalk.yellow( `# skip ${stats.skipped}` ) );
		console.log( chalk.cyan( `# todo ${stats.todo}` ) );
		console.log( chalk.red( `# fail ${stats.failed}` ) );

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
