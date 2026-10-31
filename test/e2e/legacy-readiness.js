// Preserve Puppeteer's readiness boundaries: Chromium's networkIdle lifecycle,
// two seconds of request quiescence, then one browser task before releasing rAF.
export async function gotoWithLegacyNetworkIdle( page, client, url ) {

	await client.send( 'Page.enable' );
	await client.send( 'Page.setLifecycleEventsEnabled', { enabled: true } );
	const { frameTree } = await client.send( 'Page.getFrameTree' );
	let onLifecycle;
	let timeout;
	const idle = new Promise( ( resolve, reject ) => {

		onLifecycle = event => {

			if ( event.name === 'networkIdle' && event.frameId === frameTree.frame.id && event.loaderId !== frameTree.frame.loaderId ) resolve();

		};

		client.on( 'Page.lifecycleEvent', onLifecycle );
		timeout = setTimeout( () => reject( new Error( 'Navigation network idle timeout' ) ), 300000 );

	} );
	try {

		await Promise.all( [ page.goto( url, { waitUntil: 'load', timeout: 300000 } ), idle ] );

	} finally {

		clearTimeout( timeout );
		client.off( 'Page.lifecycleEvent', onLifecycle );

	}

}

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
