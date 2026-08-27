/* global chrome, importScripts, MESSAGE_ID, MESSAGE_INIT, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, EVENT_REGISTER, EVENT_COMMITTED */

importScripts( 'constants.js' );

// Map tab IDs to devtools panel connections
const connections = new Map();

// Panel requests that are forwarded to the page
const FORWARDABLE_MESSAGES = new Set( [
	MESSAGE_REQUEST_STATE,
	MESSAGE_REQUEST_OBJECT_DETAILS,
	MESSAGE_SCROLL_TO_CANVAS,
	MESSAGE_HIGHLIGHT_OBJECT,
	MESSAGE_UNHIGHLIGHT_OBJECT
] );

// Badge helpers. The tab may already be gone, so errors are ignored.
function setBadge( tabId, text, color ) {

	chrome.action.setBadgeText( { tabId: tabId, text: text } ).catch( () => {} );
	chrome.action.setBadgeTextColor( { tabId: tabId, color: '#ffffff' } ).catch( () => {} );
	chrome.action.setBadgeBackgroundColor( { tabId: tabId, color: color } ).catch( () => {} );

}

function clearBadge( tabId ) {

	chrome.action.setBadgeText( { tabId: tabId, text: '' } ).catch( () => {} );

}

// Toolbar icon click scrolls the page to its first canvas
chrome.action.onClicked.addListener( ( tab ) => {

	// No content script in this tab (e.g. chrome:// pages)
	chrome.tabs.sendMessage( tab.id, { name: MESSAGE_SCROLL_TO_CANVAS } ).catch( () => {} );

} );

// Listen for connections from the devtools panel
chrome.runtime.onConnect.addListener( ( port ) => {

	let tabId;

	port.onMessage.addListener( ( message ) => {

		if ( message.name === MESSAGE_INIT ) {

			tabId = message.tabId;
			connections.set( tabId, port );

		} else if ( FORWARDABLE_MESSAGES.has( message.name ) ) {

			chrome.tabs.sendMessage( tabId, message );

		}

	} );

	// Clean up when devtools is closed
	port.onDisconnect.addListener( () => {

		connections.delete( tabId );

	} );

} );

// Messages from the content script
chrome.runtime.onMessage.addListener( ( message, sender ) => {

	if ( message.scheme ) {

		chrome.action.setIcon( {
			path: {
				128: `icons/128-${message.scheme}.png`
			}
		} );

	}

	if ( sender.tab === undefined ) return;

	const tabId = sender.tab.id;

	// If three.js is detected, show its revision as a badge
	if ( message.name === EVENT_REGISTER ) {

		const revision = message.detail.revision;
		const isDev = revision.includes( 'dev' );

		setBadge( tabId, revision.replace( /\D+$/, '' ), isDev ? '#ff0098' : '#049ef4' );

	}

	const port = connections.get( tabId );

	if ( port !== undefined ) {

		// The panel keeps track of which frame each renderer and scene came from
		message.frameId = sender.frameId;

		try {

			port.postMessage( message );

		} catch ( error ) {

			// Port already disconnected

		}

	}

} );

// A navigated frame's renderers and scenes are gone, let the panel drop them
chrome.webNavigation.onCommitted.addListener( ( { tabId, frameId } ) => {

	if ( frameId === 0 ) clearBadge( tabId );

	const port = connections.get( tabId );

	if ( port !== undefined ) {

		port.postMessage( { id: MESSAGE_ID, name: EVENT_COMMITTED, frameId: frameId } );

	}

} );
