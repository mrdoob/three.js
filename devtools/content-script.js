/* global chrome */

// This script runs in the context of the web page
// console.log( 'Three.js DevTools: Content script loaded at document_readyState:', document.readyState ); // Comment out

// Inject the bridge script into the main document or a target (e.g., iframe)
function injectBridge( target = document ) {

	if ( target.__threejs_devtools_bridge_injected ) return;
	target.__threejs_devtools_bridge_injected = true;

	const script = document.createElement( 'script' );
	// Use UMD/IIFE build for Three.js for global THREE
	const threeUrl = chrome.runtime.getURL( 'panel/build/three.core.js' );
	// TODO: Use a UMD/IIFE build for GLTFExporter when available
	const exporterUrl = chrome.runtime.getURL( 'panel/exporters/GLTFExporter.umd.js' );

	// Only bridge.js is loaded from the extension package
	script.src = chrome.runtime.getURL( 'bridge.js' );

	script.onload = function () {

		this.remove();

	};

	( target.head || target.documentElement ).appendChild( script );
	script.setAttribute( 'data-three-url', threeUrl );
	script.setAttribute( 'data-exporter-url', exporterUrl );

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

	const messageWithSource = { ...event.data, source };
	chrome.runtime.sendMessage( messageWithSource );

}


// Listener for messages forwarded from the background script (originating from panel)
// Remove unused parameters 'sender' and 'sendResponse' to fix linter warnings
function handleBackgroundMessage( message ) {

	// Forward 'request-state' and 'export-scene' to the bridge
	if ( message.name === 'request-state' || message.name === 'export-scene' ) {

		//console.log('[Three.js DevTools] Content script received and forwarding:', message.name);
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


// Handshake: notify background when content script is ready
try {

	chrome.runtime.sendMessage( { name: 'three-devtools-content-ready' } );

} catch ( e ) {

	console.warn( '[Three.js DevTools] Handshake send failed:', e );

}

