/* global chrome */

// Map tab IDs to connections
const connections = new Map();

// Handle extension icon clicks in the toolbar
chrome.action.onClicked.addListener( ( tab ) => {

	// Send scroll-to-canvas message to the content script (no UUID = scroll to first canvas)
	chrome.tabs.sendMessage( tab.id, {
		name: 'scroll-to-canvas',
		tabId: tab.id
	} ).catch( () => {
		// Tab might not have the content script injected
		console.log( 'Could not send scroll-to-canvas message to tab', tab.id );
	} );

} );

// Listen for connections from the devtools panel
chrome.runtime.onConnect.addListener( port => {

	let tabId;

	// Listen for messages from the devtools panel
	port.onMessage.addListener( message => {

		if ( message.name === 'init' ) {

			tabId = message.tabId;
			connections.set( tabId, port );

		} else if ( message.name === 'request-state' && tabId ) {

			chrome.tabs.sendMessage( tabId, message );

		} else if ( message.name === 'request-object-details' && tabId ) {

			chrome.tabs.sendMessage( tabId, message );

		} else if ( message.name === 'scroll-to-canvas' && tabId ) {

			chrome.tabs.sendMessage( tabId, message );

		} else if ( tabId === undefined ) {

			console.warn( 'Background: Message received from panel before init:', message );

		}

	} );

	// Clean up when devtools is closed
	port.onDisconnect.addListener( () => {

		if ( tabId ) {

			connections.delete( tabId );

		}

	} );

} );

// Listen for messages from the content script
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {

	if ( message.scheme ) {

		chrome.action.setIcon( {
			path: {
				128: `icons/128-${message.scheme}.png`
			}
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

	return false; // Return false to indicate synchronous handling

} );

// Listen for page navigation events
chrome.webNavigation.onCommitted.addListener( details => {

	const { tabId, frameId } = details;

	// Clear badge on navigation, only for top-level navigation
	if ( frameId === 0 ) {

		chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => { /* Tab might be gone */ } );

	}

	const port = connections.get( tabId );

	if ( port ) {

		port.postMessage( {
			id: 'three-devtools',
			name: 'committed',
			frameId: frameId
		} );

	}

} );

// Clear badge when a tab is closed
chrome.tabs.onRemoved.addListener( ( tabId ) => {

	chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => { /* Tab might be gone */ } );

	// Clean up connection if it exists for the closed tab
	if ( connections.has( tabId ) ) {

		connections.delete( tabId );

	}

} );
