/* global chrome, importScripts, MESSAGE_ID, MESSAGE_INIT, MESSAGE_REGISTER, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, MESSAGE_SET_MONITORING, MESSAGE_COMMITTED, STORAGE_KEY_MONITORING */

importScripts( 'constants.js' );

// Map tab IDs to connections
const connections = new Map();

// Context menu item on the toolbar icon
const MENU_MONITORING_ID = 'three-devtools-monitoring';

// Read the persisted monitoring state (default: on)
function getMonitoringEnabled() {

	return chrome.storage.local.get( { [ STORAGE_KEY_MONITORING ]: true } )
		.then( ( items ) => items[ STORAGE_KEY_MONITORING ] === true );

}

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

// Show the monitoring state ('off') or the three.js revision on the badge
function updateBadge( tabId, revision, monitoringEnabled ) {

	if ( ! monitoringEnabled ) {

		setBadge( tabId, 'off', '#666666' );
		return;

	}

	if ( ! revision ) {

		setBadge( tabId, '' );
		return;

	}

	revision = String( revision );
	const number = revision.replace( /\D+$/, '' );
	const isDev = revision.includes( 'dev' );

	setBadge( tabId, number, isDev ? '#ff0098' : '#049ef4' );

}

// Sync a tab's bridge with the monitoring state. When enabled the bridge
// responds with a full state refresh.
function sendSetMonitoring( tabId, enabled ) {

	chrome.tabs.sendMessage( tabId, {
		name: MESSAGE_SET_MONITORING,
		enabled: enabled,
		tabId: tabId
	} ).catch( () => {

		// Ignore error - content script might not be injected yet

	} );

}

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

// Add a monitoring on/off checkbox to the toolbar icon context menu
chrome.runtime.onInstalled.addListener( () => {

	chrome.contextMenus.removeAll( () => {

		getMonitoringEnabled().then( ( enabled ) => {

			chrome.contextMenus.create( {
				id: MENU_MONITORING_ID,
				title: 'Enable monitoring',
				type: 'checkbox',
				checked: enabled,
				contexts: [ 'action' ]
			} );

		} );

	} );

} );

chrome.contextMenus.onClicked.addListener( ( info ) => {

	if ( info.menuItemId === MENU_MONITORING_ID ) {

		chrome.storage.local.set( { [ STORAGE_KEY_MONITORING ]: info.checked === true } );

	}

} );

// React to monitoring changes from the context menu or the panel: update the
// menu checkbox and the badge/bridge of every tab where three.js registered
chrome.storage.onChanged.addListener( ( changes, area ) => {

	if ( area !== 'local' || ! ( STORAGE_KEY_MONITORING in changes ) ) return;

	const enabled = changes[ STORAGE_KEY_MONITORING ].newValue === true;

	chrome.contextMenus.update( MENU_MONITORING_ID, { checked: enabled } ).catch( () => {

		// Ignore error - menu might not have been created yet

	} );

	chrome.storage.session.get( null ).then( ( items ) => {

		for ( const key of Object.keys( items ) ) {

			if ( ! key.startsWith( 'revision-' ) ) continue;

			const tabId = parseInt( key.slice( 'revision-'.length ), 10 );

			updateBadge( tabId, items[ key ], enabled );
			sendSetMonitoring( tabId, enabled );

		}

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

			// Sync the page with the persisted monitoring state
			getMonitoringEnabled().then( ( enabled ) => {

				sendSetMonitoring( tabId, enabled );

			} );

		} else if ( forwardableMessages.has( message.name ) && tabId ) {

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

			const revision = String( message.detail.revision );

			// Remember the revision so the badge can be restored on re-enable
			chrome.storage.session.set( { [ 'revision-' + tabId ]: revision } );

			getMonitoringEnabled().then( ( enabled ) => {

				updateBadge( tabId, revision, enabled );

				// A freshly loaded page's bridge defaults to enabled
				if ( ! enabled ) sendSetMonitoring( tabId, false );

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

		setBadge( tabId, '' );
		chrome.storage.session.remove( 'revision-' + tabId );

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
	chrome.storage.session.remove( 'revision-' + tabId );

	// Clean up connection if it exists for the closed tab
	if ( connections.has( tabId ) ) {

		connections.delete( tabId );

	}

} );
