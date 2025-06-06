/* global chrome */

// Map tab IDs to connections
const connections = new Map();

// Handshake: Track tabs waiting for content script readiness
const pendingMessages = new Map();

// Listen for connections from the devtools panel
chrome.runtime.onConnect.addListener( ( port ) => {

	let tabId;

	// Listen for messages from the devtools panel
	port.onMessage.addListener( ( message ) => {

		//console.debug('Background: Received message from panel:', message);

		if ( message.name === 'init' ) {

			tabId = message.tabId;
			connections.set( tabId, port );
			console.debug( `Background: Connection initialized for tab ${tabId}` );

		} else if ( message.name === 'request-state' && tabId ) {

			chrome.tabs.sendMessage( tabId, message );

		} else if ( message.name.startsWith( 'export-' ) && tabId ) {

			console.log( 'Background: Received export-scene from panel:', message );
			console.log( 'Background: Forwarding export-scene message to tab:', message );
			chrome.tabs.sendMessage( tabId, message );

		} else if ( tabId === undefined ) {

			console.warn(
				'Background: Message received from panel before init:',
				message
			);

		}

	} );

	// Clean up when devtools is closed
	port.onDisconnect.addListener( () => {

		if ( tabId ) {

			connections.delete( tabId );
			console.log( `Background: Connection closed for tab ${tabId}` );

		}

	} );

} );

// Enhanced error handling for port lifecycle
chrome.runtime.onConnect.addListener( ( port ) => {

	let tabId;

	port.onMessage.addListener( ( message ) => {

		if ( message.name === 'init' ) {

			tabId = message.tabId;
			connections.set( tabId, port );

		} else if ( tabId === undefined ) {

			console.warn( 'Background: Message received from panel before init:', message );

		}

	} );

	port.onDisconnect.addListener( () => {

		if ( tabId ) {

			connections.delete( tabId );
			console.log( `Background: Connection closed for tab ${tabId}` );

		}

	} );

} );

// Ensure runtime context initialization
chrome.webNavigation.onCommitted.addListener( ( details ) => {

	const { tabId, frameId } = details;

	if ( frameId === 0 ) {

		chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => {
			/* Tab might be gone */
		} );

	}

	const port = connections.get( tabId );
	if ( port ) {

		port.postMessage( {
			id: 'three-devtools',
			name: 'committed',
			frameId: frameId,
		} );

	}

} );


// Listen for handshake from content script
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {

	if ( message.name === 'three-devtools-content-ready' && sender.tab ) {

		const tabId = sender.tab.id;
		console.log( `[Three.js DevTools] Background received handshake from tab ${tabId}` );
		if ( pendingMessages.has( tabId ) ) {

			const { message: queuedMessage, retryCount } = pendingMessages.get( tabId );
			console.log( `Background: Handshake received from tab ${tabId}, retrying message.` );
			pendingMessages.delete( tabId );
			// Retry sending the original message
			sendMessageToTab( tabId, queuedMessage, retryCount );

		}

	}

	//console.debug('Background: Received message from content script:', message);

	if ( message.scheme ) {

		chrome.action.setIcon( {
			path: {
				128: `icons/128-${message.scheme}.png`,
			},
		} );

	}

	if ( sender.tab ) {

		const tabId = sender.tab.id;

		// If three.js is detected, show a badge
		if ( message.name === 'register' && message.detail && message.detail.revision ) {

			const revision = String( message.detail.revision );
			const number = revision.replace( /\D+$/, '' );
			const isDev = revision.includes( 'dev' );

			chrome.action.setBadgeText( { tabId: tabId, text: number } ).catch( () => { /* Tab might be gone */ } );
			chrome.action.setBadgeTextColor( { tabId: tabId, color: '#ffffff' } ).catch( () => { /* Tab might be gone */ } );
			chrome.action.setBadgeBackgroundColor( { tabId: tabId, color: isDev ? '#ff0098' : '#049ef4' } ).catch( () => { /* Tab might be gone */ } );

		}

		const port = connections.get( tabId );
		if ( port ) {

			// Forward the message to the devtools panel
			try {

				port.postMessage( message );
				// Send immediate response to avoid "message channel closed" error
				sendResponse( { received: true } );

			} catch ( e ) {

				console.error( 'Error posting message to devtools:', e );
				// If the port is broken, clean up the connection
				connections.delete( tabId );

			}

		}

	}

	// --- BEGIN: Handle background download requests (for export fallback) ---
	if ( message.type === 'request-background-download' && message.detail ) {

		const { filename, dataUrl, blob, binary } = message.detail;
		let url = dataUrl;
		let cleanupUrl = false;

		// If a Blob is provided, create a blob URL
		if ( ! url && blob ) {

			try {

				const blobObj = new Blob( [ blob ], { type: binary ? 'model/gltf-binary' : 'application/octet-stream' } );
				url = URL.createObjectURL( blobObj );
				cleanupUrl = true;

			} catch ( e ) {

				console.warn( 'Background: Failed to create blob URL for download:', e );
				sendResponse && sendResponse( { error: e.message } );
				return false;

			}

		}

		if ( ! url ) {

			console.warn( 'Background: No dataUrl or blob provided for background download' );
			sendResponse && sendResponse( { error: 'No dataUrl or blob provided' } );
			return false;

		}

		chrome.downloads.download( {
			url: url,
			filename: filename || ( binary ? 'scene.glb' : 'scene.gltf' ),
			saveAs: true
		}, function ( downloadId ) {

			if ( chrome.runtime.lastError ) {

				console.warn( 'Background: Background download failed:', chrome.runtime.lastError );
				sendResponse && sendResponse( { error: chrome.runtime.lastError.message } );

			} else {

				console.log( 'Background: Background download started with ID:', downloadId );
				sendResponse && sendResponse( { success: true, downloadId: downloadId } );

			}

			// Clean up blob URL after a short delay
			if ( cleanupUrl && url ) {

				setTimeout( function () {

					URL.revokeObjectURL( url );
					console.log( 'Background: Cleaned up object URL for background download' );

				}, 5000 );

			}

		} );

		// Keep the message channel open for sendResponse
		return true;

	}
	// --- END: Handle background download requests ---

	return false; // Return false to indicate synchronous handling

} );
// Clear badge when a tab is closed
chrome.tabs.onRemoved.addListener( ( tabId ) => {

	chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => {
		/* Tab might be gone */
	} );

	// Clean up connection if it exists for the closed tab
	if ( connections.has( tabId ) ) {

		connections.delete( tabId );

	}

} );
