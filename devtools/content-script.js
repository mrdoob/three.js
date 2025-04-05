// This script runs in the context of the web page
console.log( 'Three.js DevTools: Content script loaded at document.readyState:', document.readyState );

// Function to inject the bridge script
function injectBridge( target = document ) {

	const script = document.createElement( 'script' );
	script.src = chrome.runtime.getURL( 'bridge.js' );
	script.onload = function () {

		this.remove();

	};

	( target.head || target.documentElement ).appendChild( script );

	return script;

}

// Also inject into any existing iframes
function injectIntoIframes() {

	const iframes = document.querySelectorAll( 'iframe' );
	iframes.forEach( iframe => {

		try {

			injectBridge( iframe.contentDocument );

		} catch ( e ) {

			// Ignore cross-origin iframe errors
			console.log( 'DevTools: Could not inject into iframe:', e );

		}

	} );

}

// Initial injection
injectBridge();
injectIntoIframes();

// Watch for new iframes being added
const observer = new MutationObserver( mutations => {

	mutations.forEach( mutation => {

		mutation.addedNodes.forEach( node => {

			if ( node.tagName === 'IFRAME' ) {

				// Wait for iframe to load
				node.addEventListener( 'load', () => {

					try {

						injectBridge( node.contentDocument );

					} catch ( e ) {

						// Ignore cross-origin iframe errors
						// console.log( 'DevTools: Could not inject into iframe:', e );

					}

				} );

			}

		} );

	} );

} );

observer.observe( document.documentElement, {
	childList: true,
	subtree: true
} );

// Helper function to check if extension context is valid
function isExtensionContextValid() {

	try {

		// This will throw if context is invalidated
		chrome.runtime.getURL( '' );
		return true;

	} catch ( error ) {

		return false;

	}

}

// Handle messages from the main window
function handleMainWindowMessage( event ) {

	// Only accept messages from the same frame
	if ( event.source !== window ) {

		return;

	}

	const message = event.data;
	if ( ! message || message.id !== 'three-devtools' ) {

		return;

	}

	// Check extension context before sending message
	if ( ! isExtensionContextValid() ) {

		console.warn( 'Extension context invalidated, cannot send message' );
		return;

	}

	// Add source information
	const messageWithSource = {
		...event.data,
		source: event.source === window ? 'main' : 'iframe'
	};

	// Forward to background page
	chrome.runtime.sendMessage( messageWithSource );

}

// Handle messages from iframes
function handleIframeMessage( event ) {

	// Skip messages from main window
	if ( event.source === window ) {

		return;

	}

	const message = event.data;
	if ( ! message || message.id !== 'three-devtools' ) {

		return;

	}

	// Check extension context before sending message
	if ( ! isExtensionContextValid() ) {

		console.warn( 'Extension context invalidated, cannot send message' );
		return;

	}

	// Add source information
	const messageWithSource = {
		...event.data,
		source: 'iframe'
	};

	// Forward to background page
	chrome.runtime.sendMessage( messageWithSource );

}

// Handle messages from devtools
function handleDevtoolsMessage( message, sender, sendResponse ) {

	// Forward traverse requests to both main page and iframes
	if ( message.name === 'traverse' || message.name === 'reload-scene' || message.name === 'visibility' ) {

		// console.log( 'Content script: Forwarding message to page:', message );
		window.postMessage( message, '*' );

		// Also try to forward to all iframes
		const iframes = document.querySelectorAll( 'iframe' );
		iframes.forEach( iframe => {

			try {

				iframe.contentWindow.postMessage( message, '*' );

			} catch ( e ) {

				// Ignore cross-origin iframe errors

			}

		} );

		// Send immediate response to avoid "message channel closed" error
		sendResponse( { received: true } );

	}

	// Return false to indicate synchronous handling
	return false;

}

// Add event listeners
window.addEventListener( 'message', handleMainWindowMessage, false );
window.addEventListener( 'message', handleIframeMessage, false );
chrome.runtime.onMessage.addListener( handleDevtoolsMessage );

// Listen for messages from the panel
chrome.runtime.onMessage.addListener( ( message, sender, sendResponse ) => {

	if ( message.name === 'visibility' ) {

		// Forward visibility state to the injected script
		window.postMessage( {
			id: 'three-devtools',
			name: 'panel-visibility', // Use a distinct name
			value: message.value
		}, '*' );

	}

} );
