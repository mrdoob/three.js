/* global chrome */

// This script runs in the context of the web page

// Constants
const MESSAGE_ID = 'three-devtools';
const MESSAGE_REQUEST_STATE = 'request-state';
const MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
const MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
const MESSAGE_HIGHLIGHT_OBJECT = 'highlight-object';
const MESSAGE_UNHIGHLIGHT_OBJECT = 'unhighlight-object';

// Inject the bridge script into the main document or a target (e.g., iframe)
function injectBridge( target = document ) {

	const bridgeScript = document.createElement( 'script' );
	bridgeScript.src = chrome.runtime.getURL( 'bridge.js' );
	bridgeScript.onload = function () {

		this.remove();

		// Inject highlight.js after bridge.js loads
		const highlightScript = document.createElement( 'script' );
		highlightScript.src = chrome.runtime.getURL( 'highlight.js' );
		highlightScript.onload = function () {

			this.remove();

		};

		( target.head || target.documentElement ).appendChild( highlightScript );

	};

	( target.head || target.documentElement ).appendChild( bridgeScript );
	return bridgeScript;

}

// Inject bridge into all existing iframes
function injectIntoIframes() {

	document.querySelectorAll( 'iframe' ).forEach( iframe => {

		try {

			if ( iframe.contentDocument ) injectBridge( iframe.contentDocument );

		} catch ( e ) {

			// Ignore cross-origin errors when accessing iframe content

		}

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

					} catch ( e ) {

						// Ignore cross-origin errors when accessing iframe content

					}

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

