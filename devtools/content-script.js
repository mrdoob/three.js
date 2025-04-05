// This script runs in the context of the web page
// console.log( 'Three.js DevTools: Content script loaded at document_readyState:', document.readyState ); // Comment out

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
			// console.log( 'DevTools: Could not inject into iframe:', e ); // Comment out

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
						// console.log( 'DevTools: Could not inject into iframe:', e ); // Comment out

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

// Listener for messages forwarded from the background script (originating from panel)
function handleBackgroundMessage( message, sender, sendResponse ) {

	// Check if the message is one we need to forward to the bridge
	// Only forward request-initial-state now
	if ( message.name === 'request-initial-state' ) {

		// console.log( 'Content script: Forwarding message to bridge:', message.name );
		window.postMessage( message, '*' ); // Forward the message as is to the page

		// Optional: Forward to iframes too, if needed (might cause duplicates if bridge is in iframe)
		/*
		const iframes = document.querySelectorAll('iframe');
		iframes.forEach(iframe => {
			try {
				iframe.contentWindow.postMessage(message, '*');
			} catch (e) {}
		});
		*/

	}
	// Keep channel open? No, this listener is synchronous for now.
	// return true;

}

// Add event listeners
window.addEventListener( 'message', handleMainWindowMessage, false );
window.addEventListener( 'message', handleIframeMessage, false );
// chrome.runtime.onMessage.addListener( handleDevtoolsMessage ); // This seems redundant/incorrectly placed in original code

// Use a single listener for messages from the background script
chrome.runtime.onMessage.addListener( handleBackgroundMessage );
