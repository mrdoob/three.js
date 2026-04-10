/* global chrome */

// Constants
const MESSAGE_ID = 'three-devtools';
const MESSAGE_REQUEST_STATE = 'request-state';
const MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
const MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
const MESSAGE_HIGHLIGHT_OBJECT = 'highlight-object';
const MESSAGE_UNHIGHLIGHT_OBJECT = 'unhighlight-object';

// Helper to check if extension context is valid
function isExtensionContextValid() {

	try {

		chrome.runtime.getURL( '' );
		return true;

	} catch ( error ) {

		return false;

	}

}

// Unified message handler for window messages
function handleWindowMessage( event ) {

	// Only accept messages with the correct id
	if ( ! event.data || event.data.id !== MESSAGE_ID ) return;

	// Determine source: 'main' for window, 'iframe' otherwise
	const source = event.source === window ? 'main' : 'iframe';

	if ( ! isExtensionContextValid() ) {

		console.warn( 'Extension context invalidated, cannot send message' );
		return;

	}

	event.data.source = source;
	chrome.runtime.sendMessage( event.data );

}

// Listener for messages from the background script (originating from panel)
function handleBackgroundMessage( message ) {

	const forwardableMessages = new Set( [
		MESSAGE_REQUEST_STATE,
		MESSAGE_REQUEST_OBJECT_DETAILS,
		MESSAGE_SCROLL_TO_CANVAS,
		MESSAGE_HIGHLIGHT_OBJECT,
		MESSAGE_UNHIGHLIGHT_OBJECT
	] );

	if ( forwardableMessages.has( message.name ) ) {

		message.id = MESSAGE_ID;
		window.postMessage( message, '*' );

	}

}

// Add event listeners
window.addEventListener( 'message', handleWindowMessage, false );
chrome.runtime.onMessage.addListener( handleBackgroundMessage );

// Icon color scheme
const isLightTheme = window.matchMedia( '(prefers-color-scheme: light)' ).matches;
chrome.runtime.sendMessage( { scheme: isLightTheme ? 'light' : 'dark' } );
window.matchMedia( '(prefers-color-scheme: light)' ).onchange = event => {

	chrome.runtime.sendMessage( { scheme: event.matches ? 'light' : 'dark' } );

};

