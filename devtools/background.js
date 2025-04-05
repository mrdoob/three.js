// Map tab IDs to connections
const connections = new Map();

// Listen for connections from the devtools panel
chrome.runtime.onConnect.addListener(port => {
	let tabId;
	
	// Listen for messages from the devtools panel
	port.onMessage.addListener(message => {
		if (message.name === 'init') {
			tabId = message.tabId;
			connections.set(tabId, port);
		} else if ((message.name === 'traverse' || message.name === 'reload-scene') && tabId) {
			// Forward traverse or reload request to content script
			chrome.tabs.sendMessage(tabId, message);
		} else if (message.name === 'request-initial-state' && tabId) {
			chrome.tabs.sendMessage(tabId, message);
		} else if (tabId === undefined) {
			console.warn('Background: Message received from panel before init:', message);
		}
	});

	// Clean up when devtools is closed
	port.onDisconnect.addListener(() => {
		if (tabId) {
			connections.delete(tabId);
		}
	});
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (sender.tab) {
		const tabId = sender.tab.id;
		const port = connections.get(tabId);
		if (port) {
			// Forward the message to the devtools panel
			try {
				port.postMessage(message);
				// Send immediate response to avoid "message channel closed" error
				sendResponse({ received: true });
			} catch (e) {
				console.error('Error posting message to devtools:', e);
				// If the port is broken, clean up the connection
				connections.delete(tabId);
			}
		}
	}
	return false; // Return false to indicate synchronous handling
});

// Listen for page navigation events
chrome.webNavigation.onCommitted.addListener(details => {
	const { tabId, frameId } = details;
	const port = connections.get(tabId);
	
	if (port) {
		port.postMessage({
			id: 'three-devtools',
			type: 'committed',
			frameId: frameId
		});
	}
}); 