/* global chrome */

// Export message handler for Three.js DevTools
// This script is injected into the page to handle export messages specifically

// Listen for export-related messages from the bridge
window.addEventListener( 'message', function ( event ) {

	// Only accept messages from the same frame
	if ( event.source !== window ) return;

	const message = event.data;
	if ( ! message || message.id !== 'three-devtools' ) return;

	if ( message.name !== 'request-state' && message.name !== 'export-scene' && message.name !== 'renderer' ) {

		console.log( '[Three.js DevTools] Export handler received message:', event.data );

	}

	// Forward all export progress messages to the background page to reach the panel
	if (
		message.name === 'export-started' ||
		message.name === 'export-file-generated' ||
		message.name === 'export-download-initiated' ||
		message.name === 'export-complete' ||
		message.name === 'export-error' ||
		message.name === 'export-result' ||
		message.name === 'export-result-meta'
	) {

		chrome.runtime.sendMessage( {
			id: 'three-devtools',
			name: message.name,
			detail: message.detail
		} );

	}

}, false );
