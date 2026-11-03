// Preserve Puppeteer's readiness boundaries: two seconds of request quiescence,
// then one browser task before releasing rAF.
export async function waitForLegacyNetworkIdle( page, pendingRequests ) {

	await new Promise( ( resolve, reject ) => {

		let idle;
		const cleanup = () => {

			clearTimeout( idle );
			clearTimeout( timeout );
			for ( const event of [ 'request', 'requestfinished', 'requestfailed' ] ) page.off( event, activity );
			page.off( 'close', interrupted );
			page.off( 'crash', interrupted );

		};

		const interrupted = () => {

			cleanup();
			reject( new Error( 'Page closed or crashed while waiting for network idle' ) );

		};

		const activity = () => {

			clearTimeout( idle );
			if ( pendingRequests.size === 0 ) idle = setTimeout( () => {

				cleanup();
				resolve();

			}, 2000 );

		};

		const timeout = setTimeout( () => {

			cleanup();
			reject( new Error( 'Network idle timeout' ) );

		}, 300000 );
		for ( const event of [ 'request', 'requestfinished', 'requestfailed' ] ) page.on( event, activity );
		page.on( 'close', interrupted );
		page.on( 'crash', interrupted );
		if ( page.isClosed() ) interrupted();
		else activity();

	} );

}

export async function renderOnce( page ) {

	await page.evaluate( async () => {

		await new Promise( resolve => setTimeout( resolve, 0 ) );
		window._renderStarted = true;
		await new Promise( resolve => {

			const start = performance._now();
			const interval = setInterval( () => {

				// A timeout also supports examples that render without a rAF loop.
				if ( window._renderFinished || performance._now() - start > 5000 ) {

					clearInterval( interval );
					resolve();

				}

			}, 100 );

		} );

	} );

}
