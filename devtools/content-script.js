// This script runs in the context of the web page
// console.log( 'Three.js DevTools: Content script loaded at document_readyState:', document.readyState ); // Comment out

// Track extension context validity
let isExtensionValid = true;

// Implement extension recovery mechanism
let recoveryAttempts = 0;
const MAX_RECOVERY_ATTEMPTS = 3;
const RECOVERY_INTERVAL = 1000; // ms

// Function to attempt recovery of extension functionality
function attemptRecovery() {
    if (recoveryAttempts >= MAX_RECOVERY_ATTEMPTS) {
        console.warn('DevTools: Max recovery attempts reached, giving up');
        return;
    }

    recoveryAttempts++;
    console.log(`DevTools: Attempting recovery (${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS})`);

    try {
        // Test if extension context is valid again
        if (isExtensionContextValid()) {
            console.log('DevTools: Extension context restored, reinitializing');
            isExtensionValid = true;
            recoveryAttempts = 0;
            safeInitialInjection();

            // Restart observer if needed
            if (document.documentElement && !observer.disconnect) {
                observer.observe(document.documentElement, {
                    childList: true,
                    subtree: true
                });
            }
        } else {
            // Schedule another attempt
            setTimeout(attemptRecovery, RECOVERY_INTERVAL);
        }
    } catch (error) {
        console.warn('DevTools: Recovery attempt failed:', error);
        // Schedule another attempt
        setTimeout(attemptRecovery, RECOVERY_INTERVAL);
    }
}

// Function to safely inject the bridge script with retries
function injectBridge(target = document) {
    try {
        // Validate extension context first
        if (!isExtensionContextValid()) {
            console.warn('DevTools: Extension context invalid, aborting injection');
            attemptRecovery();
            return null;
        }

        // Check if target is valid and has necessary elements
        if (!target || (!target.head && !target.documentElement)) {
            // If document isn't ready yet, retry later
            if (target === document && document.readyState !== 'complete') {
                setTimeout(() => {
                    if (isExtensionValid) {
                        injectBridge(target);
                    }
                }, 100);
                return null;
            }
            // Log but don't throw for invalid targets - common with cross-origin frames
            return null;
        }

        // Wrap all Chrome API calls in try-catch
        let scriptSrc;
        let exporterUrl;
        try {
            scriptSrc = chrome.runtime.getURL('bridge.js');
            exporterUrl = chrome.runtime.getURL('panel/third_party/GLTFExporter.js');
        } catch (error) {
            if (error.message.includes('Extension context invalidated')) {
                isExtensionValid = false;
                console.warn('DevTools: Extension context invalidated during URL resolution');
                attemptRecovery();
                return null;
            }
            throw error; // Re-throw other errors
        }

        const script = document.createElement('script');
        // Set bridge script src and exporter URL attribute
        script.src = scriptSrc;
        script.setAttribute('data-exporter-url', exporterUrl);
        script.onload = function() {
            this.remove();
        };
        script.onerror = function(event) {
            console.warn('DevTools: Bridge script failed to load:', event);
        };

        // Check again before appendChild to be absolutely sure
        const targetElement = target.head || target.documentElement;
        if (targetElement) {
            targetElement.appendChild(script);
            return script;
        } else {
            console.warn('DevTools: Target element not available for script injection');
            return null;
        }
    } catch (error) {
        // Special handling for extension context invalidation
        if (error.message && error.message.includes('Extension context invalidated')) {
            isExtensionValid = false;
            console.warn('DevTools: Extension context invalidated during injection');
            attemptRecovery();
        } else {
            console.warn('DevTools: Failed to inject bridge script:', error);
        }
        return null;
    }
}

// Also inject into any existing iframes
function injectIntoIframes() {
    if (!isExtensionValid) return;

    try {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                // Skip injection if iframe isn't loaded or accessible
                if (!iframe.contentWindow || !iframe.contentDocument) {
                    // Add a load event listener to retry when it's ready
                    iframe.addEventListener('load', () => {
                        if (isExtensionValid) {
                            try {
                                injectBridge(iframe.contentDocument);
                            } catch (e) {
                                // Silently ignore - likely cross-origin issue
                            }
                        }
                    });
                    return;
                }

                // Try to inject if iframe seems ready
                injectBridge(iframe.contentDocument);
            } catch (e) {
                // Ignore cross-origin iframe errors - this is expected
            }
        });
    } catch (e) {
        console.warn('DevTools: Error processing iframes:', e);
    }
}

// Wait for document to be ready before initial injection
function safeInitialInjection() {
    try {
        // If document ready, inject immediately
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            injectBridge();
            injectIntoIframes();
        } else {
            // Otherwise wait for DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                if (isExtensionValid) {
                    injectBridge();
                    injectIntoIframes();
                }
            });

            // Also try on load as a fallback
            window.addEventListener('load', () => {
                if (isExtensionValid) {
                    injectBridge();
                    injectIntoIframes();
                }
            });
        }
    } catch (error) {
        console.warn('DevTools: Initial injection setup failed:', error);
    }
}

// Start safe initial injection
safeInitialInjection();

// Watch for new iframes being added
const observer = new MutationObserver(mutations => {
    if (!isExtensionValid) {
        observer.disconnect();
        attemptRecovery();
        return;
    }

    // Process mutations
    try {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IFRAME') {
                    // Wait for iframe to load
                    node.addEventListener('load', () => {
                        if (!isExtensionValid) return;

                        try {
                            if (node.contentDocument) {
                                injectBridge(node.contentDocument);
                            }
                        } catch (e) {
                            // Ignore cross-origin iframe errors
                        }
                    });
                }
            });
        });
    } catch (error) {
        console.warn('DevTools: Error processing mutations:', error);
    }
});

// Only observe if extension is valid and document is available
if (isExtensionValid && document.documentElement) {
    try {
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    } catch (error) {
        console.warn('DevTools: Failed to set up observer:', error);
    }
}

// Helper function to check if extension context is valid
function isExtensionContextValid() {
    try {
        // This will throw if context is invalidated
        chrome.runtime.getURL('');
        return true;
    } catch (error) {
        isExtensionValid = false;
        if (error.message && error.message.includes('Extension context invalidated')) {
            console.debug('DevTools: Extension context invalidated, scheduling recovery');
            setTimeout(attemptRecovery, 100); // Schedule recovery with a slight delay
        }
        return false;
    }
}

// Handle messages from the main window - using fire-and-forget approach
function handleMainWindowMessage(event) {
    // Only accept messages from the same frame
    if (event.source !== window) {
        return;
    }

    const message = event.data;
    if (!message || message.id !== 'three-devtools') {
        return;
    }

    // Check extension context before sending message
    if (!isExtensionContextValid()) {
        return;
    }

    // Handle special case for Planner5D or other sites that need background download help
    if (message.type === 'request-background-download' && message.detail) {
        handleBackgroundDownload(message.detail);
        return;
    }

    // Special handling for direct download messages that contain actual file data
    if (message.type === 'direct-download' && message.detail) {
        handleDirectDownload(message.detail);
        return;
    }

    // Add source information for regular messages
    const messageWithSource = {
        ...event.data,
        source: event.source === window ? 'main' : 'iframe',
        timestamp: Date.now()
    };

    // Use fire-and-forget pattern for regular messages
    try {
        chrome.runtime.sendMessage(messageWithSource);
    } catch (error) {
        console.debug('DevTools Content Script: Error in fire-and-forget send:', error.message);
        isExtensionValid = false;
        attemptRecovery();
    }
}

// Handle alternative download method for sites like Planner5D that may block direct downloads
function handleBackgroundDownload(detail) {
    try {
        const { sceneUuid, binary, filename, dataUrl } = detail;
        console.log(`DevTools: Setting up background download for ${binary ? 'GLB' : 'GLTF'} file: ${filename}`);

        // Fetch the data from the URL
        fetch(dataUrl)
            .then(response => response.blob())
            .then(blob => {
                // Size of the data to be downloaded
                const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
                console.log(`DevTools: Downloaded data for background download: ${sizeMB} MB`);

                // Send the blob data to the background script for download
                chrome.runtime.sendMessage({
                    id: 'three-devtools',
                    action: 'background-download',
                    filename: filename,
                    blob: blob,
                    type: binary ? 'model/gltf-binary' : 'application/json',
                    size: blob.size,
                    sceneUuid: sceneUuid
                }, response => {
                    if (response && response.success) {
                        console.log(`DevTools: Background download initiated for ${filename}`);

                        // Clean up the URL
                        URL.revokeObjectURL(dataUrl);

                        // Notify about successful export
                        window.postMessage({
                            id: 'three-devtools',
                            type: 'export-complete',
                            detail: {
                                sceneUuid: sceneUuid,
                                binary: binary,
                                size: blob.size
                            }
                        }, '*');
                    } else {
                        console.error('DevTools: Background download failed:', response?.error || 'Unknown error');
                    }
                });
            })
            .catch(error => {
                console.error('DevTools: Error fetching data for background download:', error);
            });
    } catch (error) {
        console.error('DevTools: Error setting up background download:', error);
    }
}

// Handle direct download requests that contain the actual file data
function handleDirectDownload(detail) {
    try {
        console.log(`DevTools: Processing direct download for ${detail.binary ? 'binary GLB' : 'JSON GLTF'} file (${(detail.size / (1024 * 1024)).toFixed(2)} MB)`);

        let blob;

        // Handle binary GLB files (from base64 data)
        if (detail.binary && detail.base64data) {
            // Convert base64 back to binary
            const binaryString = atob(detail.base64data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            blob = new Blob([bytes], { type: 'model/gltf-binary' });
        }
        // Handle JSON GLTF files
        else if (!detail.binary && detail.jsonData) {
            blob = new Blob([detail.jsonData], { type: 'application/json' });
        } else {
            console.error('DevTools: Invalid direct download data', detail);
            return;
        }

        // Create download URL and trigger download
        const url = URL.createObjectURL(blob);

        // Request the download via the background script
        chrome.runtime.sendMessage({
            id: 'three-devtools',
            action: 'direct-download',
            url: url,
            filename: detail.filename,
            size: detail.size
        }, (response) => {
            // Clean up the blob URL after download starts
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

            if (response && response.error) {
                console.error('DevTools: Download failed:', response.error);
            }
        });
    } catch (error) {
        console.error('DevTools: Error processing direct download:', error);
    }
}

// Handle messages from iframes - using fire-and-forget approach
function handleIframeMessage(event) {
    // Skip messages from main window
    if (event.source === window) {
        return;
    }

    const message = event.data;
    if (!message || message.id !== 'three-devtools') {
        return;
    }

    // Check extension context before sending message
    if (!isExtensionContextValid()) {
        return;
    }

    // Add source information
    const messageWithSource = {
        ...event.data,
        source: 'iframe',
        timestamp: Date.now()
    };

    // Use fire-and-forget pattern instead of waiting for a response
    try {
        chrome.runtime.sendMessage(messageWithSource);
    } catch (error) {
        console.debug('DevTools Content Script: Error in iframe fire-and-forget send:', error.message);
        isExtensionValid = false;
        attemptRecovery();
    }
}

// Listener for messages forwarded from the background script (originating from panel)
function handleBackgroundMessage(message, sender, sendResponse) {
    // Check if extension is still valid
    if (!isExtensionValid) {
        sendResponse({ error: 'Extension context invalid' });
        attemptRecovery();
        return;
    }

    // Check if the message is one we need to forward to the bridge
    if (message.name === 'request-state' || message.name === 'export-scene') {
        try {
            // Ensure the message has the correct ID before forwarding to the page
            message.id = 'three-devtools';
            window.postMessage(message, '*'); // Forward the modified message to the page
            sendResponse({ success: true });
        } catch (error) {
            console.warn('DevTools: Error forwarding message to page:', error);
            sendResponse({ error: error.message });
        }
    } else {
        sendResponse({ received: true });
    }
}

// Add event listeners
window.addEventListener('message', handleMainWindowMessage, false);
window.addEventListener('message', handleIframeMessage, false);

// Use a single listener for messages from the background script

chrome.runtime.onMessage.addListener(handleBackgroundMessage);

// Monkey-patch addEventListener to make scroll-blocking events passive by default
(function() {
    const originalAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        const passiveEvents = ['mousewheel', 'wheel', 'touchstart', 'touchmove'];
        if (passiveEvents.includes(type)) {
            if (!options || (typeof options === 'object' && options.passive === undefined)) {
                options = Object.assign({}, options, { passive: true });
            }
        }
        return originalAdd.call(this, type, listener, options);
    };
})();

// Intercept document.write to suppress fastboot warnings
(function() {
    const origWrite = Document.prototype.write;
    Document.prototype.write = function(...args) {
        console.warn('DevTools: document.write intercepted', args);
        return origWrite.apply(this, args);
    };
})();


