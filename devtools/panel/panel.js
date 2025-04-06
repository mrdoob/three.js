// Store the state of our inspector
const state = {
	revision: null,
	scenes: new Map(),
	renderers: new Map(),
	objects: new Map()
};

// console.log('Panel script loaded');

// Create a connection to the background page
const backgroundPageConnection = chrome.runtime.connect({
	name: "three-devtools"
});

// Initialize the connection with the inspected tab ID
backgroundPageConnection.postMessage({
	name: 'init',
	tabId: chrome.devtools.inspectedWindow.tabId
});

// Request the initial state from the bridge script
backgroundPageConnection.postMessage({
	name: 'request-state',
	tabId: chrome.devtools.inspectedWindow.tabId
});

let intervalId = setInterval(() => {
	backgroundPageConnection.postMessage({
		name: 'request-state',
		tabId: chrome.devtools.inspectedWindow.tabId
	});
}, 1000);

backgroundPageConnection.onDisconnect.addListener(() => {
	console.log('Panel: Connection to background page lost');
	clearInterval(intervalId);
	clearState();
});	

// console.log('Connected to background page with tab ID:', chrome.devtools.inspectedWindow.tabId);

// Store renderer collapse states
const rendererCollapsedState = new Map();

// Clear state when panel is reloaded
function clearState() {
	state.revision = null;
	state.scenes.clear();
	state.renderers.clear();
	state.objects.clear();
	const container = document.getElementById('scene-tree');
	if (container) {
		container.innerHTML = '';
	}
}

// Listen for messages from the background page
backgroundPageConnection.onMessage.addListener(function (message) {
	if (message.id === 'three-devtools') {
		handleThreeEvent(message);
	}
});

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
			// console.log('Observed object:', detail);
			
			// Only store each unique object once
			if (!state.objects.has(detail.uuid)) {
				state.objects.set(detail.uuid, detail);
				
				if (detail.isRenderer) {
					state.renderers.set(detail.uuid, detail);
				}
				else if (detail.isScene) {
					state.scenes.set(detail.uuid, detail);
				}
				
				updateUI();
			}
			break;
			
		// Handle a batch of objects for a specific scene
		case 'scene':
			const { sceneUuid, objects: batchObjects } = message.detail;
			console.log('Panel: Received scene batch for', sceneUuid, 'with', batchObjects.length, 'objects');

			// 1. Identify UUIDs in the new batch
			const newObjectUuids = new Set(batchObjects.map(obj => obj.uuid));

			// 2. Identify current object UUIDs associated with this scene that are NOT renderers
			const currentSceneObjectUuids = new Set();
			state.objects.forEach((obj, uuid) => {
				// Use the _sceneUuid property we'll add below, or check if it's the scene root itself
				if (!obj.isRenderer && (obj._sceneUuid === sceneUuid || uuid === sceneUuid)) {
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
			
		case 'update':
			const update = message.detail;
			if (update.type === 'WebGLRenderer') {
				// console.log('Received renderer update:', { uuid: update.uuid, hasProperties: !!update.properties });
				const renderer = state.renderers.get(update.uuid);
				if (renderer) {
					// Always update the internal state
					renderer.properties = update.properties;

					// Check if the details section is currently open before updating DOM
					const summaryElement = document.querySelector(`.renderer-summary[data-uuid="${renderer.uuid}"]`);
					// Find the parent <details> element
					const detailsElement = summaryElement ? summaryElement.closest('details.renderer-container') : null;

					if (detailsElement && detailsElement.tagName === 'DETAILS') {
						// Update the summary line text content (size, calls, tris) within the summary element
						if (summaryElement) {
							const iconSpan = summaryElement.querySelector('.icon'); // Keep existing icon span for toggle
							const typeSpan = summaryElement.querySelector('.type');
							const labelSpan = summaryElement.querySelector('.label');
							if (iconSpan && labelSpan && typeSpan && renderer.properties) {
								const props = renderer.properties;
								const details = [`${props.width}x${props.height}`];
								if (props.info) {
									details.push(`${props.info.render.calls} calls`);
									details.push(`${props.info.render.triangles.toLocaleString()} tris`);
								}
								const displayName = `WebGLRenderer <span class="object-details">${details.join(' ・ ')}</span>`;
								labelSpan.innerHTML = displayName;
							}
						}

						// Update properties list only if details are open
						if (detailsElement.open) {
							const propsContainer = detailsElement.querySelector('.properties-list');
							if (propsContainer) {
								updateRendererProperties(renderer, propsContainer);
							}
						}
					}
				} else {
					// console.warn('Renderer update received for unknown UUID:', update.uuid);
				}
			}
			break;
			
		case 'committed':
			// Page was reloaded, clear state
			clearState();
			break;
	}
}

// Function to update just the renderer properties in the UI
function updateRendererProperties(renderer, propsContainer) {
	const props = renderer.properties;

	// Clear existing properties from the specific container
	propsContainer.innerHTML = '';

	// Create the two-column grid container
	const gridContainer = document.createElement('div');
	gridContainer.className = 'properties-grid';

	const leftColumn = document.createElement('div');
	leftColumn.className = 'properties-column-left';

	const rightColumn = document.createElement('div');
	rightColumn.className = 'properties-column-right';

	// Function to create sections (no longer collapsible)
	function createSection(title, properties) {
		const section = document.createElement('div'); // Use div
		section.className = 'properties-section';
		
		const header = document.createElement('div'); // Use div for header
		header.className = 'properties-header';
		header.textContent = title;
		section.appendChild(header);

		properties.forEach(([name, value]) => {
			// Always create the element, use '-' for undefined values
			const displayValue = (value === undefined || value === null) ? '-' : value;
			const propElem = document.createElement('div');
			propElem.className = 'property-item';
			propElem.innerHTML = `
				<span class="property-name">${name}:</span>
				<span class="property-value">${displayValue}</span>
			`;
			section.appendChild(propElem);
		});

		return section;
	}

	// Basic properties section
	const basicProps = [
		['Size', `${props.width}x${props.height}`],
		['Drawing Buffer', `${props.drawingBufferWidth}x${props.drawingBufferHeight}`],
		['Alpha', props.alpha],
		['Antialias', props.antialias],
		['Output Color Space', props.outputColorSpace],
		['Tone Mapping', props.toneMapping],
		['Tone Mapping Exposure', props.toneMappingExposure],
		['Shadows', props.shadowMapEnabled ? `enabled (${props.shadowMapType})` : 'disabled'],
		['Auto Clear', props.autoClear],
		['Auto Clear Color', props.autoClearColor],
		['Auto Clear Depth', props.autoClearDepth],
		['Auto Clear Stencil', props.autoClearStencil],
		['Local Clipping', props.localClippingEnabled],
		['Physically Correct Lights', props.physicallyCorrectLights]
	];
	leftColumn.appendChild(createSection('Properties', basicProps));

	// Define stats arrays outside the if block, using optional chaining and defaults
	const renderStats = [
		['Frame', props.info?.render?.frame ?? '-'],
		['Draw Calls', props.info?.render?.calls ?? '-'],
		['Triangles', props.info?.render?.triangles?.toLocaleString() ?? '-'],
		['Points', props.info?.render?.points ?? '-'],
		['Lines', props.info?.render?.lines ?? '-'],
		['Sprites', props.info?.render?.sprites ?? '-'],
		['Geometries', props.info?.render?.geometries ?? '-']
	];

	const memoryStats = [
		['Geometries', props.info?.memory?.geometries ?? '-'],
		['Textures', props.info?.memory?.textures ?? '-'],
		['Shader Programs', props.info?.memory?.programs ?? '-'],
		['Render Lists', props.info?.memory?.renderLists ?? '-'],
		['Render Targets', props.info?.memory?.renderTargets ?? '-']
	];

	// Always append stats sections
	rightColumn.appendChild(createSection('Render Stats', renderStats));
	rightColumn.appendChild(createSection('Memory', memoryStats));

	// Append columns to the grid container, and grid to the main props container
	gridContainer.appendChild(leftColumn);
	gridContainer.appendChild(rightColumn);
	propsContainer.appendChild(gridContainer);
}

// Function to get an object icon based on its type
function getObjectIcon(obj) {
	if (obj.isScene) return '🌍';
	if (obj.isCamera) return '📷';
	if (obj.isLight) return '💡';
	if (obj.isMesh) return '🔷';
	if (obj.type === 'Group') return '📁';
	return '📦';
}

// Function to render an object and its children
function renderObject(obj, container, level = 0) {
	const icon = getObjectIcon(obj);
	let displayName = obj.name || obj.type;
	
	// Handle Renderer Specifics
	if (obj.isRenderer) {
		// Create <details> element as the main container
		const detailsElement = document.createElement('details');
		detailsElement.className = 'renderer-container';
		detailsElement.setAttribute('data-uuid', obj.uuid);
		// Set initial state (default collapsed = true)
		detailsElement.open = !(rendererCollapsedState.get(obj.uuid) ?? true);
		// Add toggle listener to save state
		detailsElement.addEventListener('toggle', () => {
			rendererCollapsedState.set(obj.uuid, !detailsElement.open);
		});

		// Create the summary element (clickable header) - THIS IS THE FIRST CHILD
		const summaryElem = document.createElement('summary'); // USE <summary> tag
		summaryElem.className = 'tree-item renderer-summary'; // Acts as summary
		summaryElem.style.paddingLeft = `${level * 20}px`;
		
		// Update display name in the summary line
		if (obj.properties) {
			const props = obj.properties;
			const details = [`${props.width}x${props.height}`];
			if (props.info) {
				details.push(`${props.info.render.calls} calls`);
				details.push(`${props.info.render.triangles.toLocaleString()} tris`);
			}
			displayName = `WebGLRenderer <span class="object-details">${details.join(' ・ ')}</span>`;
		}
		// Use toggle icon instead of paint icon
		summaryElem.innerHTML = `<span class="icon toggle-icon"></span> 
			<span class="label">${displayName}</span>
			<span class="type">${obj.type}</span>`;
		detailsElement.appendChild(summaryElem); // Append summary div FIRST

		// Create the container for properties inside <details> - THIS IS SECOND CHILD
		const propsContainer = document.createElement('div');
		propsContainer.className = 'properties-list';
		propsContainer.style.paddingLeft = summaryElem.style.paddingLeft.replace('px', '') + 24 + 'px';
		detailsElement.appendChild(propsContainer);

		container.appendChild(detailsElement); // Append details to the main container

		// Call updateRendererProperties to populate the container
		if (obj.properties) {
			updateRendererProperties(obj, propsContainer);
		}
	} else {
		// Default rendering for other object types
		const elem = document.createElement('div');
		elem.className = 'tree-item';
		elem.style.paddingLeft = `${level * 20}px`;
		elem.setAttribute('data-uuid', obj.uuid);
		
		let labelContent = `<span class="icon">${icon}</span>
			<span class="label">${displayName}</span>
			<span class="type">${obj.type}</span>`;

		if (obj.isScene) {
			// Add object count for scenes
			let objectCount = 0;
			function countObjects(uuid) {
				const object = state.objects.get(uuid);
				if (object) {
					objectCount++; // Increment count for the object itself
					if (object.children) {
						object.children.forEach(childId => countObjects(childId));
					}
				}
			}
			countObjects(obj.uuid);
			displayName = `${obj.name || obj.type} <span class="object-details">${objectCount} objects</span>`;
			labelContent = `<span class="icon">${icon}</span>
				<span class="label">${displayName}</span>
				<span class="type">${obj.type}</span>`;
		}
		elem.innerHTML = labelContent;
		container.appendChild(elem);
	}

	// Handle children (excluding children of renderers, as properties are shown in details)
	if (!obj.isRenderer && obj.children && obj.children.length > 0) {
		// Create a container for children
		const childContainer = document.createElement('div');
		childContainer.className = 'children';
		container.appendChild(childContainer);

		// Get all children and sort them by type for better organization
		const children = obj.children
			.map(childId => state.objects.get(childId))
			.filter(child => child !== undefined)
			.sort((a, b) => {
				// Sort order: Cameras, Lights, Groups, Meshes, Others
				const typeOrder = {
					isCamera: 1,
					isLight: 2,
					isGroup: 3,
					isMesh: 4
				};
				const aOrder = Object.entries(typeOrder).find(([key]) => a[key])?.['1'] || 5;
				const bOrder = Object.entries(typeOrder).find(([key]) => b[key])?.['1'] || 5;
				return aOrder - bOrder;
			});

		// Render each child
		children.forEach(child => {
			renderObject(child, childContainer, level + 1);
		});
	}
}

// Function to update the UI
function updateUI() {

	const container = document.getElementById('scene-tree');
	container.innerHTML = '';

	// Add version info if available
	if (state.revision) {
		const versionInfo = document.createElement('div');
		versionInfo.className = 'info-item';
		versionInfo.textContent = `Three.js r${state.revision}`;
		container.appendChild(versionInfo);
	}

	// Add renderers section
	if (state.renderers.size > 0) {
		const renderersSection = document.createElement('div');
		renderersSection.className = 'section';
		renderersSection.innerHTML = '<h3>Renderers</h3>';
		
		state.renderers.forEach(renderer => {
			renderObject(renderer, renderersSection);
		});
		
		container.appendChild(renderersSection);
	}

	// Add scenes section
	if (state.scenes.size > 0) {
		const scenesSection = document.createElement('div');
		scenesSection.className = 'section';
		scenesSection.innerHTML = '<h3>Scenes</h3>';
		
		state.scenes.forEach(scene => {
			renderObject(scene, scenesSection);
		});
		
		container.appendChild(scenesSection);
	}
}

// Initial UI update
clearState();
updateUI();