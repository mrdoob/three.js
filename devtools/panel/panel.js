// Wrap panel script to guard against invalid extension context
;(function() {
	// Abort if not running inside DevTools panel
	if (typeof chrome === 'undefined' || !chrome.devtools || !chrome.devtools.inspectedWindow) {
		console.warn('Panel: invalid context, skipping panel script');
		return;
	}

	// Ensure extension context is valid before initializing
	if (!chrome.runtime || !chrome.runtime.connect) {
		console.warn('Panel: chrome.runtime.connect unavailable, panel context invalid, skipping initialization');
	} else {
		try {
			// Suppress Extension context invalidated errors
			window.addEventListener('error', event => {
				if (event.error && event.error.message.includes('Extension context invalidated')) {
					console.warn('Panel: suppressed extension context invalidated error');
					event.preventDefault();
				}
			});
			window.addEventListener('unhandledrejection', event => {
				if (event.reason && event.reason.message.includes('Extension context invalidated')) {
					console.warn('Panel: suppressed extension context invalidated rejection');
					event.preventDefault();
				}
			});

			const state = {
				revision: null,
				scenes: new Map(),
				renderers: new Map(),
				objects: new Map(),
				selectedSceneUuid: null,
				isExporting: false, // track pending export
				exportGLTFBtn: null, // reference to GLTF export button
				exportGLBBtn: null // reference to GLB export button
			};

			// console.log('Panel script loaded');

			// Safely retrieve inspected tab ID
			let panelTabId = null;
			try {
				panelTabId = chrome.devtools.inspectedWindow.tabId;
			} catch (e) {
				console.warn('Panel: chrome.devtools.inspectedWindow.tabId unavailable', e);
			}

			// Create a connection to the background page (safely)
			let backgroundPageConnection;
			try {
				backgroundPageConnection = chrome.runtime.connect({ name: 'three-devtools' });
			} catch (error) {
				console.error('Panel: Failed to connect to background page:', error);
			}

			// Initialize the connection with the inspected tab ID
			if (backgroundPageConnection && panelTabId !== null) {
				try {
					backgroundPageConnection.postMessage({ name: 'init', tabId: panelTabId });
				} catch (error) {
					console.warn('Panel: init postMessage failed:', error);
				}
			}

			// Request the initial state from the bridge script
			if (backgroundPageConnection && panelTabId !== null) {
				try {
					backgroundPageConnection.postMessage({ name: 'request-state', tabId: panelTabId });
				} catch (error) {
					console.warn('Panel: request-state postMessage failed:', error);
				}
			}

			// Variable to track if extension context is still valid
			let isExtensionContextValid = true;

			// Periodically request state updates
			const intervalId = setInterval(() => {
				if (!isExtensionContextValid) {
					clearInterval(intervalId);
					return;
				}

				if (backgroundPageConnection && panelTabId !== null) {
					try {
						backgroundPageConnection.postMessage({ name: 'request-state', tabId: panelTabId });
					} catch (error) {
						// Check if this is a context invalidation error
						if (error.message && error.message.includes('Extension context invalidated')) {
							console.warn('Panel: Extension context invalidated, stopping periodic updates');
							isExtensionContextValid = false;
							clearInterval(intervalId);
						} else {
							console.warn('Panel: periodic request-state failed:', error);
						}
					}
				}
			}, 1000);

			if (backgroundPageConnection) {
				backgroundPageConnection.onDisconnect.addListener(() => {
					console.log('Panel: Connection to background page lost');
					isExtensionContextValid = false;
					clearInterval(intervalId);
					clearState();
				});
			}

			// console.log('Connected to background page with tab ID:', chrome.devtools.inspectedWindow.tabId);

			// Store renderer collapse states
			const rendererCollapsedState = new Map();

			// Clear state when panel is reloaded
			function clearState() {

				state.revision = null;
				state.scenes.clear();
				state.renderers.clear();
				state.objects.clear();
				state.selectedSceneUuid = null;
				const container = document.getElementById('scene-tree');
				if (container) {

					container.innerHTML = '';

				}

			}

			// Listen for messages from the background page
			if (backgroundPageConnection) {
				backgroundPageConnection.onMessage.addListener(function (message) {
					try {
						if (message.id === 'three-devtools') {
							handleThreeEvent(message);
						}
					} catch (err) {
						if (!err.message.includes('Extension context invalidated')) throw err;
						console.warn('Panel: extension context invalidated caught');
					}
				});
			}

			function handleThreeEvent(message) {

				// console.log('Handling event:', message.type);
				switch (message.type) {

					case 'register':
						state.revision = message.detail.revision;
						updateUI();
						break;

					// Handle individual renderer observation
					case 'renderer':
						const detail = message.detail;

						// Only store each unique object once
						if (!state.objects.has(detail.uuid)) {

							state.objects.set(detail.uuid, detail);
							state.renderers.set(detail.uuid, detail);

						}

						// Update or add the renderer in the state map
						state.renderers.set(detail.uuid, detail); // Ensure the latest detail is always stored
						// Also update the generic objects map if renderers are stored there too
						state.objects.set(detail.uuid, detail);

						// The DOM update logic previously here is redundant because updateUI()
						// rebuilds the entire renderer element anyway, using the updated data
						// from state.renderers and the persisted open/closed state.

						updateUI(); // Call updateUI to rebuild based on the new state

						break;

					// Handle a batch of objects for a specific scene
					case 'scene':
						const { sceneUuid, objects: batchObjects } = message.detail;

						// 1. Identify UUIDs in the new batch
						const newObjectUuids = new Set(batchObjects.map(obj => obj.uuid));

						// 2. Identify current object UUIDs associated with this scene that are NOT renderers
						const currentSceneObjectUuids = new Set();
						state.objects.forEach((obj, uuid) => {

							// Use the _sceneUuid property we'll add below, or check if it's the scene root itself
							if (obj._sceneUuid === sceneUuid || uuid === sceneUuid) {

								currentSceneObjectUuids.add(uuid);

							}

						});

						// 3. Find UUIDs to remove (in current state for this scene, but not in the new batch)
						const uuidsToRemove = new Set();
						currentSceneObjectUuids.forEach(uuid => {

							if (!newObjectUuids.has(uuid)) {

								uuidsToRemove.add(uuid);

							}

						});

						// 4. Remove stale objects from state
						uuidsToRemove.forEach(uuid => {

							state.objects.delete(uuid);
							// If a scene object itself was somehow removed (unlikely for root), clean up scenes map too
							if (state.scenes.has(uuid)) {

								state.scenes.delete(uuid);

							}

						});

						// 5. Process the new batch: Add/Update objects and mark their scene association
						batchObjects.forEach(objData => {

							// Add a private property to track which scene this object belongs to
							objData._sceneUuid = sceneUuid;
							state.objects.set(objData.uuid, objData);

							// Ensure the scene root is in the scenes map
							if (objData.isScene && objData.uuid === sceneUuid) {

								state.scenes.set(objData.uuid, objData);

							}
							// Note: Renderers are handled separately by 'renderer' events and shouldn't appear in scene batches.

						});

						// Update UI once after processing the entire batch
						updateUI();
						break;

					case 'committed':
						// Page was reloaded, clear state
						clearState();
						break;

					case 'export-result': {
						console.log('Panel: Export result received:', message.detail);
						const { sceneUuid, binary, result } = message.detail;

						// Create a blob with the proper MIME type for the download
						const blob = new Blob(
							[binary ? result : (typeof result === 'string' ? result : JSON.stringify(result, null, 2))],
							{ type: binary ? 'model/gltf-binary' : 'application/json' }
						);

						// Create proper filename with timestamp for uniqueness
						const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
						const filename = binary ? `scene-${timestamp}.glb` : `scene-${timestamp}.gltf`;

						// Create download URL
						const url = URL.createObjectURL(blob);

						// Send URL to background to download
						chrome.runtime.sendMessage({
							action: 'save-file',
							url: url,
							filename: filename
						}, (response) => {
							URL.revokeObjectURL(url);
							if (response && response.error) {
								console.error('Download failed:', response.error);
							}
						});

						// Re-enable export buttons
						state.isExporting = false;
						if (state.exportGLTFBtn) state.exportGLTFBtn.disabled = false;
						if (state.exportGLBBtn) state.exportGLBBtn.disabled = false;

						break;
					}

					case 'export-result-meta': {
						console.log('Panel: Export metadata received:', message.detail);
						const { sceneUuid, binary, url, filename, size } = message.detail;

						// Re-enable export buttons
						state.isExporting = false;
						if (state.exportGLTFBtn) state.exportGLTFBtn.disabled = false;
						if (state.exportGLBBtn) state.exportGLBBtn.disabled = false;

						// Show a success message and download link in the panel
						const container = document.getElementById('scene-tree');
						if (container) {
							// Create export results container
							const resultsDiv = document.createElement('div');
							resultsDiv.className = 'export-results';
							resultsDiv.style.marginTop = '12px';
							resultsDiv.style.padding = '8px';
							resultsDiv.style.backgroundColor = 'rgba(0, 128, 0, 0.1)';
							resultsDiv.style.borderRadius = '4px';

							// Add success message with file size
							const sizeInMB = (size / (1024 * 1024)).toFixed(2);
							const successMsg = document.createElement('div');
							successMsg.innerHTML = `✅ <strong>Export successful!</strong> (${sizeInMB} MB)`;
							successMsg.style.marginBottom = '8px';
							resultsDiv.appendChild(successMsg);

							// Add download link
							const link = document.createElement('a');
							link.href = url;
							link.download = filename;
							link.textContent = `Download ${filename}`;
							link.style.display = 'inline-block';
							link.style.padding = '4px 8px';
							link.style.backgroundColor = '#007bff';
							link.style.color = 'white';
							link.style.borderRadius = '4px';
							link.style.textDecoration = 'none';
							link.style.cursor = 'pointer';
							resultsDiv.appendChild(link);

							// Add click-to-dismiss functionality
							const closeBtn = document.createElement('button');
							closeBtn.textContent = '×';
							closeBtn.style.float = 'right';
							closeBtn.style.background = 'none';
							closeBtn.style.border = 'none';
							closeBtn.style.cursor = 'pointer';
							closeBtn.style.fontSize = '16px';
							closeBtn.style.color = '#555';
							closeBtn.onclick = () => resultsDiv.remove();
							resultsDiv.appendChild(closeBtn);

							// Add to container (prepend to put at top)
							const firstChild = container.firstChild;
							if (firstChild) {
								container.insertBefore(resultsDiv, firstChild.nextSibling);
							} else {
								container.appendChild(resultsDiv);
							}
						}
						break;
					}

				}

			}

			// Function to get an object icon based on its type
			function getObjectIcon(obj) {
				if (obj.isScene) return '🌍';
				if (obj.isCamera) return '📷';
				if (obj.isLight) return '💡';
				if (obj.isInstancedMesh) return '🔸';
				if (obj.isMesh) return '🔷';
				if (obj.type === 'Group') return '📁';
				return '📦';
			}

			// Function to update the UI
			function updateUI() {
				// Auto-select a scene if none selected and at least one exists
				if (!state.selectedSceneUuid && state.scenes.size > 0) {
					state.selectedSceneUuid = state.scenes.keys().next().value;
				}

				const container = document.getElementById('scene-tree');
				container.innerHTML = '';

				// Version info
				const versionInfo = document.createElement('div');
				versionInfo.className = 'info-item';
				versionInfo.style.display = 'flex';
				versionInfo.style.justifyContent = 'space-between';
				const threeVersionSpan = document.createElement('span');
				if (state.revision) threeVersionSpan.textContent = `Three.js r${state.revision}`;
				const manifestVersionSpan = document.createElement('span');
				manifestVersionSpan.textContent = chrome.runtime.getManifest().version;
				manifestVersionSpan.style.opacity = '0.5';
				versionInfo.appendChild(threeVersionSpan);
				versionInfo.appendChild(manifestVersionSpan);
				container.appendChild(versionInfo);

				// Export controls
				if (state.selectedSceneUuid) {
					const controls = document.createElement('div');
					controls.style.margin = '8px 0';
					const btnGltf = document.createElement('button'); btnGltf.textContent = 'Export GLTF';
					btnGltf.disabled = state.isExporting;
					btnGltf.onclick = () => { backgroundPageConnection.postMessage({ name: 'export-scene', sceneUuid: state.selectedSceneUuid, binary: false }); state.isExporting = true; };
					const btnGlb = document.createElement('button'); btnGlb.textContent = 'Export GLB';
					btnGlb.disabled = state.isExporting;
					btnGlb.onclick = () => { backgroundPageConnection.postMessage({ name: 'export-scene', sceneUuid: state.selectedSceneUuid, binary: true }); state.isExporting = true; };
					controls.appendChild(btnGltf);
					controls.appendChild(btnGlb);
					// Store references for later toggle and fallback
					state.exportGLTFBtn = btnGltf;
					state.exportGLBBtn = btnGlb;
					container.appendChild(controls);
				}

				// Renderers section
				if (state.renderers.size) {
					const sec = document.createElement('div'); sec.className = 'section'; sec.innerHTML = '<h3>Renderers</h3>';
					state.renderers.forEach(r => renderRenderer(r, sec));
					container.appendChild(sec);
				}

				// Scenes section
				if (state.scenes.size) {
					const sec = document.createElement('div'); sec.className = 'section'; sec.innerHTML = '<h3>Scenes</h3>';
					state.scenes.forEach(s => renderObject(s, sec));
					container.appendChild(sec);
				}
			}

			// Helper functions
			function renderRenderer(obj, container) {
				// Create <details> element as the main container
				const detailsElement = document.createElement('details');
				detailsElement.className = 'renderer-container';
				detailsElement.setAttribute('data-uuid', obj.uuid);
				// Preserve collapse state
				detailsElement.open = rendererCollapsedState.get(obj.uuid) || false;
				detailsElement.addEventListener('toggle', () => {
					rendererCollapsedState.set(obj.uuid, detailsElement.open);
				});
				// Summary header
				const summaryElem = document.createElement('summary');
				summaryElem.className = 'tree-item renderer-summary';
				const props = obj.properties;
				const details = [`${props.width}x${props.height}`];
				if (props.info) {
					details.push(`${props.info.render.calls} draws`);
					details.push(`${props.info.render.triangles.toLocaleString()} triangles`);
				}
				summaryElem.innerHTML = `<span class="icon toggle-icon"></span>
					<span class="label">${obj.type} <span class="object-details">${details.join(' ・ ')}</span></span>
					<span class="type">${obj.type}</span>`;
				detailsElement.appendChild(summaryElem);
				// Properties container
				const propsContainer = document.createElement('div');
				propsContainer.className = 'properties-list';
				propsContainer.style.paddingLeft = '20px';
				const grid = document.createElement('div');
				grid.style.display = 'grid';
				grid.style.gridTemplateColumns = '1fr 1fr';
				// Column 1
				const col1 = document.createElement('div'); col1.className = 'properties-column';
				col1.appendChild(createPropertyRow('Size', `${props.width}x${props.height}`));
				col1.appendChild(createPropertyRow('Alpha', props.alpha));
				col1.appendChild(createPropertyRow('Antialias', props.antialias));
				col1.appendChild(createPropertyRow('Tone Mapping', props.toneMapping));
				// Column 2
				const col2 = document.createElement('div'); col2.className = 'stats-column';
				const info = props.info || { render: {}, memory: {} };
				col2.appendChild(createPropertyRow('Draw Calls', info.render.calls));
				col2.appendChild(createPropertyRow('Triangles', info.render.triangles));
				col2.appendChild(createPropertyRow('Geometries', info.memory.geometries));
				col2.appendChild(createPropertyRow('Textures', info.memory.textures));
				grid.appendChild(col1);
				grid.appendChild(col2);
				propsContainer.appendChild(grid);
				detailsElement.appendChild(propsContainer);
				container.appendChild(detailsElement);
			}

			function renderObject(obj, container, level = 0) {
				const icon = getObjectIcon(obj);
				const elem = document.createElement('div');
				elem.className = 'tree-item';
				elem.style.paddingLeft = `${level * 20}px`;
				elem.setAttribute('data-uuid', obj.uuid);
				if (obj.isScene) {
					elem.addEventListener('click', e => { state.selectedSceneUuid = obj.uuid; updateUI(); e.stopPropagation(); });
					if (state.selectedSceneUuid === obj.uuid) elem.classList.add('selected');
				}
				let label = obj.name || obj.type;
				if (obj.isScene) {
					let count = 0;
					function countObjs(id) {
						const o = state.objects.get(id);
						if (o) { count++; o.children?.forEach(cid => countObjs(cid)); }
					}
					countObjs(obj.uuid);
					label = `${obj.name || obj.type} <span class="object-details">${count} objects</span>`;
				}
				elem.innerHTML = `<span class="icon">${icon}</span><span class="label">${label}</span><span class="type">${obj.type}</span>`;
				container.appendChild(elem);
				if (!obj.isMesh && obj.children?.length) {
					const childContainer = document.createElement('div'); childContainer.className = 'children'; container.appendChild(childContainer);
					obj.children.map(id => state.objects.get(id)).filter(Boolean).forEach(child => renderObject(child, childContainer, level + 1));
				}
			}

			function createPropertyRow(label, value) {
				const row = document.createElement('div'); row.className = 'property-row';
				row.style.display = 'flex'; row.style.justifyContent = 'space-between';
				const l = document.createElement('span'); l.className = 'property-label'; l.textContent = `${label}:`; row.appendChild(l);
				const v = document.createElement('span'); v.className = 'property-value'; v.textContent = value === undefined ? '–' : (typeof value === 'number' ? value.toLocaleString() : value); v.style.textAlign = 'right'; row.appendChild(v);
				return row;
			}
		} catch (err) {
			if (err.message.includes('Extension context invalidated')) {
				console.warn('Panel: Extension context invalidated, suppressing error');
			} else {
				throw err;
			}
		}
	}
})();
