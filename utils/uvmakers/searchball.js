/**
 * @author munrocket / https://twitter.com/munrocket_twit
 */

const puppeteer = require( 'puppeteer' );
const handler = require( 'serve-handler' );
const http = require( 'http' );
const size = 2048;
const renderTimeout = 30000;

const server = http.createServer( ( request, response ) => handler( request, response ) );
server.listen( 1234, async () => await pup );
server.on( 'SIGINT', () => process.exit( 1 ) );

const pup = puppeteer.launch( { headless: false } ).then( async browser => {

	const page = ( await browser.pages() )[ 0 ];
  await page.setViewport( { width: size, height: size } );
	await page.goto( 'http://localhost:1234/utils/uvmakers/searchball.html' );
	await page.screenshot( { path: './examples/screenshots/all_in_one.jpg', fullPage: true, type: 'jpeg', quality: 95 } );

	await page.evaluate( async ( renderTimeout ) => {

		await new Promise( ( resolve ) => {

			let renderStart = performance.now();
			let waitingLoop = setInterval( function () {

				let renderEcceded = ( performance.now() - renderStart > renderTimeout );
				if ( window.chromeRenderFinished || renderEcceded ) {

					if ( renderEcceded ) {

						console.log( 'Warning. Render timeout exceeded...' );

					}
					clearInterval( waitingLoop );
					resolve();

				}

			}, 1000 );

		});

	}, renderTimeout );

	server.close();
	browser.close();

});
