/* global chrome, importScripts, MESSAGE_ID, MESSAGE_INIT, MESSAGE_REGISTER, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, MESSAGE_SET_MONITORING, MESSAGE_TOGGLE_MONITORING, MESSAGE_COMMITTED */

importScripts( 'constants.js' );

// Map tab IDs to connections
const connections = new Map();

// Update the toolbar badge, ignoring errors for closed tabs
function setBadge( tabId, text, color ) {

	chrome.action.setBadgeText( { tabId: tabId, text: text } ).catch( () => {

		// Ignore error - tab might have been closed

	} );

	if ( color ) {

		chrome.action.setBadgeTextColor( { tabId: tabId, color: '#ffffff' } ).catch( () => {

			// Ignore error - tab might have been closed

		} );
		chrome.action.setBadgeBackgroundColor( { tabId: tabId, color: color } ).catch( () => {

			// Ignore error - tab might have been closed

		} );

	}

}

// Show the three.js revision on the toolbar badge
function updateRevisionBadge( tabId, revision ) {

	// Without a revision, leave the badge as it is
	if ( ! revision ) return;

	revision = String( revision );
	const number = revision.replace( /\D+$/, '' );
	const isDev = revision.includes( 'dev' );

	setBadge( tabId, number, isDev ? '#ff0098' : '#049ef4' );

}

// Handle extension icon clicks in the toolbar
chrome.action.onClicked.addListener( ( tab ) => {

	const port = connections.get( tab.id );

	if ( port ) {

		// Panel is open - toggle monitoring on/off
		port.postMessage( {
			id: MESSAGE_ID,
			name: MESSAGE_TOGGLE_MONITORING
		} );

		return;

	}

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
		MESSAGE_UNHIGHLIGHT_OBJECT,
		MESSAGE_SET_MONITORING
	] );

	// Listen for messages from the devtools panel
	port.onMessage.addListener( message => {

		if ( message.name === MESSAGE_INIT ) {

			tabId = message.tabId;
			connections.set( tabId, port );

		} else if ( forwardableMessages.has( message.name ) && tabId ) {

			// Reflect the monitoring state on the toolbar badge
			if ( message.name === MESSAGE_SET_MONITORING ) {

				if ( message.enabled ) {

					updateRevisionBadge( tabId, message.revision );

				} else {

					setBadge( tabId, 'off', '#666666' );

				}

			}

			chrome.tabs.sendMessage( tabId, message ).catch( () => {

				// Ignore error - content script might not be injected yet

			} );

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

			updateRevisionBadge( tabId, message.detail.revision );

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

		setBadge( tabId, '' );

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

	setBadge( tabId, '' );

	// Clean up connection if it exists for the closed tab
	if ( connections.has( tabId ) ) {

		connections.delete( tabId );

	}

} );
