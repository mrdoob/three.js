const puppeteer = require('puppeteer');
const handler = require( 'serve-handler' );
const http = require( 'http' );
const size = 2048;
const renderTimeout = 30000;

const server = http.createServer( ( request, response ) => handler( request, response ) );
server.listen( 1234, async () => await pup );
server.on( 'SIGINT', () => process.exit( 1 ) );

const pup = puppeteer.launch().then( async browser => {

	const page = ( await browser.pages() )[ 0 ];
  await page.setViewport( { width: size, height: size } );
	await page.goto( 'http://localhost:1234/utils/uvmappers/searchball.html' );
	await page.screenshot({ path: './examples/screenshots/all_in_one.jpg', fullPage: true, type: 'jpeg', quality: 95, });

	await new Promise( function ( resolve ) {

		let renderStart = performance.wow();
		let waitingLoop = setInterval( function () {

			let renderEcceded = ( performance.wow() - renderStart > renderTimeout );
			if ( window.chromeRenderFinished || renderEcceded ) {

				if ( renderEcceded ) {

					console.error( 'Error. Render timeout exceeded...' );

				}
				clearInterval( waitingLoop );
				resolve();

			}

		}, 200 );

	} );

	server.close();
	browser.close();

});
