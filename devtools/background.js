/* global chrome */

// Constants
const MESSAGE_ID = 'three-devtools';
const MESSAGE_INIT = 'init';
const MESSAGE_REQUEST_STATE = 'request-state';
const MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
const MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
const MESSAGE_HIGHLIGHT_OBJECT = 'highlight-object';
const MESSAGE_UNHIGHLIGHT_OBJECT = 'unhighlight-object';
const MESSAGE_REGISTER = 'register';
const MESSAGE_COMMITTED = 'committed';

// Map tab IDs to connections
const connections = new Map();

// Handle extension icon clicks in the toolbar
chrome.action.onClicked.addListener( ( tab ) => {

	// Send scroll-to-canvas message to the content script (no UUID = scroll to first canvas)
	chrome.tabs.sendMessage( tab.id, {
		name: MESSAGE_SCROLL_TO_CANVAS,
		tabId: tab.id
	} ).catch( () => {

		// Ignore error - tab might not have the content script injected
		console.log( 'Could not send scroll-to-canvas message to tab', tab.id );

	} );

} );

// Listen for connections from the devtools panel
chrome.runtime.onConnect.addListener( port => {

	let tabId;

	// Messages that should be forwarded to content script
	const forwardableMessages = new Set( [
		MESSAGE_REQUEST_STATE,
		MESSAGE_REQUEST_OBJECT_DETAILS,
		MESSAGE_SCROLL_TO_CANVAS,
		MESSAGE_HIGHLIGHT_OBJECT,
		MESSAGE_UNHIGHLIGHT_OBJECT
	] );

	// Listen for messages from the devtools panel
	port.onMessage.addListener( message => {

		if ( message.name === MESSAGE_INIT ) {

			tabId = message.tabId;
			connections.set( tabId, port );

		} else if ( forwardableMessages.has( message.name ) && tabId ) {

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
		if ( message.name === MESSAGE_REGISTER && message.detail && message.detail.revision ) {

			const revision = String( message.detail.revision );
			const number = revision.replace( /\D+$/, '' );
			const isDev = revision.includes( 'dev' );

			chrome.action.setBadgeText( { tabId: tabId, text: number } ).catch( () => {

				// Ignore error - tab might have been closed

			} );
			chrome.action.setBadgeTextColor( { tabId: tabId, color: '#ffffff' } ).catch( () => {

				// Ignore error - tab might have been closed

			} );
			chrome.action.setBadgeBackgroundColor( { tabId: tabId, color: isDev ? '#ff0098' : '#049ef4' } ).catch( () => {

				// Ignore error - tab might have been closed

			} );

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

		chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => {

			// Ignore error - tab might have been closed

		} );

	}

	const port = connections.get( tabId );

	if ( port ) {

		port.postMessage( {
			id: MESSAGE_ID,
			name: MESSAGE_COMMITTED,
			frameId: frameId
		} );

	}

} );

// Clear badge when a tab is closed
chrome.tabs.onRemoved.addListener( ( tabId ) => {

	chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => {

		// Ignore error - tab is already gone

	} );

	// Clean up connection if it exists for the closed tab
	if ( connections.has( tabId ) ) {

		connections.delete( tabId );

	}

} );
