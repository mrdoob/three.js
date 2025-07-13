/* global chrome */

// This script runs in the context of the web page

// Inject the bridge script into the main document or a target (e.g., iframe)
function injectBridge( target = document ) {

	const script = document.createElement( 'script' );
	script.src = chrome.runtime.getURL( 'bridge.js' );
	script.onload = function () {

		this.remove();

	};

	( target.head || target.documentElement ).appendChild( script );
	return script;

}

// Inject bridge into all existing iframes
function injectIntoIframes() {

	document.querySelectorAll( 'iframe' ).forEach( iframe => {

		try {

			if ( iframe.contentDocument ) injectBridge( iframe.contentDocument );

		} catch ( e ) { /* Ignore cross-origin errors */ }

	} );

}

// Initial injection
injectBridge();
injectIntoIframes();

// Watch for new iframes being added
new MutationObserver( mutations => {

	mutations.forEach( mutation => {

		mutation.addedNodes.forEach( node => {

			if ( node.tagName === 'IFRAME' ) {

				node.addEventListener( 'load', () => {

					try {

						if ( node.contentDocument ) injectBridge( node.contentDocument );

					} catch ( e ) { /* Ignore cross-origin errors */ }

				} );

			}

		} );

	} );

} ).observe( document.documentElement, { childList: true, subtree: true } );

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
	if ( ! event.data || event.data.id !== 'three-devtools' ) return;

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

	if ( message.name === 'request-state' ) {

		message.id = 'three-devtools';
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

