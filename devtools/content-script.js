/* global chrome */

// Chrome injects each file only once per frame, so constants.js (already
// injected into the MAIN world for bridge.js) can't be reused here
const MESSAGE_ID = 'three-devtools';

// Relay bridge messages to the background script
window.addEventListener( 'message', ( event ) => {

	// Only accept messages from the same frame
	if ( event.source !== window ) return;

	if ( ! event.data || event.data.id !== MESSAGE_ID ) return;

	try {

		chrome.runtime.sendMessage( event.data );

	} catch ( error ) {

		// Extension reloaded under a live page, chrome.runtime is gone

	}

} );

// Relay messages from the background script (panel requests, toolbar clicks) to the bridge
chrome.runtime.onMessage.addListener( ( message ) => {

	message.id = MESSAGE_ID;
	window.postMessage( message, '/' );

} );

// Toolbar icon follows the page's color scheme
const lightScheme = window.matchMedia( '(prefers-color-scheme: light)' );

function sendScheme() {

	chrome.runtime.sendMessage( { scheme: lightScheme.matches ? 'light' : 'dark' } );

}

sendScheme();
lightScheme.onchange = sendScheme;
