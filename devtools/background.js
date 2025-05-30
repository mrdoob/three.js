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
		} else if (message.name === 'request-state' && tabId) {
			// Safely send message to tab with error handling
			sendMessageToTab(tabId, message);
		} else if (message.name === 'export-scene' && tabId) {
			sendMessageToTab(tabId, message);
		} else if (message.name === 'export-result' && tabId) {
			console.log('Background: export-result received:', message);
			const port = connections.get(tabId);
			if (port) {
				try {
					port.postMessage(message);
				} catch (error) {
					console.warn('Background: Error posting export-result to panel:', error);
					// Clean up invalid connection
					connections.delete(tabId);
				}
			} else {
				console.warn('Background: export-result received but no port found for tabId:', tabId);
			}
			sendMessageToTab(tabId, message);
		} else if (tabId === undefined) {
			console.warn('Background: Message received from panel before init:', message);
		}
	});

	// Clean up when devtools is closed
	port.onDisconnect.addListener(() => {
		if (tabId) {
			connections.delete(tabId);
			console.log(`Background: DevTools disconnected for tab ${tabId}`);
		}
	});
});

// Helper function to safely send messages to tabs
function sendMessageToTab(tabId, message) {
	// First check if tab exists
	chrome.tabs.get(tabId, (tab) => {
		if (chrome.runtime.lastError) {
			console.warn(`Background: Tab ${tabId} no longer exists:`, chrome.runtime.lastError.message);
			// Clean up stale connection
			connections.delete(tabId);
			return;
		}

		// Tab exists, try to send message
		chrome.tabs.sendMessage(tabId, message, (response) => {
			if (chrome.runtime.lastError) {
				// This is expected when the content script isn't available
				// Don't log unless debugging as this creates noise
				// console.debug(`Background: Could not send message to tab ${tabId}:`, chrome.runtime.lastError.message);
			}
		});
	});
}

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	// For regular messages from content script that don't need responses
	try {
		// Handle background download requests (especially for Planner5D)
		if (message.action === 'background-download' && message.blob) {
			const { filename, type, size, sceneUuid } = message;

			console.log(`Background: Processing background download: ${filename} (${(size / (1024 * 1024)).toFixed(2)} MB)`);

			// Create a blob URL from the blob data
			const objectUrl = URL.createObjectURL(new Blob([message.blob], { type }));

			// Trigger the download using the blob URL
			chrome.downloads.download({
				url: objectUrl,
				filename: filename,
				saveAs: true
			}, (downloadId) => {
				if (chrome.runtime.lastError) {
					console.warn('Background: Background download failed:', chrome.runtime.lastError);
					sendResponse({ error: chrome.runtime.lastError.message });
				} else {
					console.log('Background: Background download started with ID:', downloadId);

					// Notify the panel about the completed download
					if (sender.tab) {
						const tabId = sender.tab.id;
						const port = connections.get(tabId);

						if (port) {
							try {
								port.postMessage({
									id: 'three-devtools',
									type: 'export-complete',
									detail: {
										sceneUuid: sceneUuid,
										binary: type === 'model/gltf-binary',
										size: size
									}
								});
							} catch (e) {
								console.debug('Background: Error posting export-complete to devtools:', e);
							}
						}
					}

					// Clean up the URL after some time
					setTimeout(() => {
						URL.revokeObjectURL(objectUrl);
						console.log('Background: Cleaned up object URL for background download');
					}, 5000);

					sendResponse({ success: true, downloadId: downloadId });
				}
			});

			// Keep the message channel open for sendResponse
			return true;
		}

		// Handle direct download messages with actual file data
		if (message.action === 'direct-download' && message.url) {
			const { url, filename, size } = message;

			// Log the direct download request
			console.log(`Background: Processing direct download: ${filename} (${(size / (1024 * 1024)).toFixed(2)} MB)`);

			// Trigger the download
			chrome.downloads.download({
				url: url,
				filename: filename,
				saveAs: true
			}, (downloadId) => {
				if (chrome.runtime.lastError) {
					console.warn('Background: Download failed:', chrome.runtime.lastError);
					sendResponse({ error: chrome.runtime.lastError.message });
				} else {
					console.log('Background: Download started with ID:', downloadId);
					sendResponse({ success: true, downloadId: downloadId });
				}
			});

			// Keep the message channel open for sendResponse
			return true;
		}

		// Handle special export-related messages
		if (message.type === 'export-result-meta' || message.type === 'export-download') {
			if (sender.tab) {
				const tabId = sender.tab.id;
				const port = connections.get(tabId);

				// First, forward metadata to the panel
				if (port) {
					try {
						// Send the metadata instead of the full result
						port.postMessage({
							id: 'three-devtools',
							type: 'export-result-meta',
							detail: message.detail
						});
					} catch (e) {
						console.debug('Background: Error posting export metadata to devtools:', e);
						connections.delete(tabId);
					}
				}

				// For actual download requests, initiate the download
				if (message.type === 'export-download' && message.detail && message.detail.url) {
					const { url, filename, binary } = message.detail;
					chrome.downloads.download(
						{
							url: url,
							filename: filename || (binary ? 'scene.glb' : 'scene.gltf'),
							saveAs: true
						},
						(downloadId) => {
							if (chrome.runtime.lastError) {
								console.warn('Background: Download failed:', chrome.runtime.lastError);
							} else {
								console.log('Background: Download started with ID:', downloadId);
							}
						}
					);
				}

				// Immediately send a response since we've processed it
				if (sendResponse) {
					sendResponse({ received: true, processed: true });
				}
				return false; // No need to keep the channel open
			}
		}

		// Handle export-complete messages to notify the panel
		if (message.type === 'export-complete' && sender.tab) {
			const tabId = sender.tab.id;
			const port = connections.get(tabId);

			if (port) {
				try {
					port.postMessage({
						id: 'three-devtools',
						type: 'export-complete',
						detail: message.detail
					});
				} catch (e) {
					console.debug('Background: Error posting export-complete to devtools:', e);
					connections.delete(tabId);
				}
			}

			sendResponse({ received: true });
			return false;
		}

		// Forward regular messages from content script to panel
		if (sender.tab) {
			const tabId = sender.tab.id;
			const port = connections.get(tabId);

			if (port) {
				try {
					port.postMessage(message);
				} catch (e) {
					console.debug('Background: Error posting message to devtools:', e);
					connections.delete(tabId);
				}
			}

			// Handle save-file action from panel differently since it requires a response
			if (message.action === 'save-file') {
				chrome.downloads.download(
					{ url: message.url, filename: message.filename, saveAs: true },
					(downloadId) => {
						if (chrome.runtime.lastError) {
							sendResponse({ error: chrome.runtime.lastError.message });
						} else {
							sendResponse({ success: true, downloadId: downloadId });
						}
					}
				);
				return true; // keep channel open for sendResponse
			}
		}
	} catch (error) {
		// Just log errors without trying to send a response
		console.debug("Background: Error handling message:", error);
	}

	// We don't expect or need a response for most messages, don't return true
	return false;
});

// Listen for page navigation events
chrome.webNavigation.onCommitted.addListener(details => {
	const { tabId, frameId } = details;
	const port = connections.get(tabId);

	if (port) {
		try {
			port.postMessage({
				id: 'three-devtools',
				type: 'committed',
				frameId: frameId
			});
		} catch (error) {
			console.warn(`Background: Error notifying port about navigation for tab ${tabId}:`, error);
			connections.delete(tabId);
		}
	}
});
