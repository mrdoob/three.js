/* global chrome */

// --- Utility Functions ---
function getObjectIcon( obj ) {

	if ( obj.isScene ) return '🌍';
	if ( obj.isCamera ) return '📷';
	if ( obj.isLight ) return '💡';
	if ( obj.isInstancedMesh ) return '🔸';
	if ( obj.isMesh ) return '🔷';
	if ( obj.type === 'Group' ) return '📁';
	return '📦';

}

function createPropertyRow( label, value ) {

	const row = document.createElement( 'div' );
	row.className = 'property-row';
	row.style.display = 'flex';
	row.style.justifyContent = 'space-between';
	row.style.marginBottom = '2px';

	const labelSpan = document.createElement( 'span' );
	labelSpan.className = 'property-label';
	labelSpan.textContent = `${label}:`;
	labelSpan.style.marginRight = '10px';
	labelSpan.style.whiteSpace = 'nowrap';

	const valueSpan = document.createElement( 'span' );
	valueSpan.className = 'property-value';
	const displayValue = ( value === undefined || value === null )
		? '–'
		: ( typeof value === 'number' ? value.toLocaleString() : value );
	valueSpan.textContent = displayValue;
	valueSpan.style.textAlign = 'right';

	row.appendChild( labelSpan );
	row.appendChild( valueSpan );
	return row;

}

// --- State ---
const state = {
	revision: null,
	scenes: new Map(),
	renderers: new Map(),
	objects: new Map()
};

// console.log('Panel script loaded');

// Create a connection to the background page
console.log( '[Panel] Attempting to connect to background page...' );
let backgroundPageConnection = null;
let reconnectTimeout = null;
let lostConnectionWarningTimeout = null;

function connectToBackground() {

	if ( backgroundPageConnection ) {

		try {

			backgroundPageConnection.disconnect();

		} catch ( e ) {}

	}

	backgroundPageConnection = chrome.runtime.connect( { name: 'three-devtools' } );
	console.log( '[Panel] Connected to background page' );

	backgroundPageConnection.onDisconnect.addListener( () => {

		console.warn( '[Panel] Background connection lost. Attempting to reconnect...' );
		if ( ! reconnectTimeout ) {

			reconnectTimeout = setTimeout( () => {

				connectToBackground();
				reconnectTimeout = null;

			}, 1000 );

		}

		if ( ! lostConnectionWarningTimeout ) {

			lostConnectionWarningTimeout = setTimeout( () => {

				//alert('Three.js DevTools: Lost connection to background. Please reload the panel if this persists.');
				lostConnectionWarningTimeout = null;

			}, 5000 );

		}

	} );

	// Re-send init and request-state after reconnect
	backgroundPageConnection.postMessage( {
		name: 'init',
		tabId: chrome.devtools.inspectedWindow.tabId
	} );
	backgroundPageConnection.postMessage( {
		name: 'request-state',
		tabId: chrome.devtools.inspectedWindow.tabId
	} );

}

function safePostMessage( msg ) {

	if ( backgroundPageConnection ) {

		try {

			backgroundPageConnection.postMessage( msg );

		} catch ( e ) {

			console.warn( '[Panel] Failed to post message to background:', e );

		}

	} else {

		console.warn( '[Panel] No background connection. Message not sent:', msg );

	}

}

connectToBackground();

const intervalId = setInterval( () => {

	safePostMessage( {
		name: 'request-state',
		tabId: chrome.devtools.inspectedWindow.tabId
	} );

}, 1000 );

backgroundPageConnection.onDisconnect.addListener( () => {

	console.log( 'Panel: Connection to background page lost' );
	clearInterval( intervalId );
	clearState();

} );

// console.log('Connected to background page with tab ID:', chrome.devtools.inspectedWindow.tabId);

// Store renderer collapse states
const rendererCollapsedState = new Map();

// Clear state when panel is reloaded
function clearState() {

	state.revision = null;
	state.scenes.clear();
	state.renderers.clear();
	state.objects.clear();
	const container = document.getElementById( 'scene-tree' );
	if ( container ) {

		container.innerHTML = '';

	}

}

// Listen for messages from the background page
backgroundPageConnection.onMessage.addListener( function ( message ) {



	if ( message.id === 'three-devtools' ) {

		handleThreeEvent( message );

	}


} );

function handleThreeEvent( message ) {

	switch ( message.name ) {

		case 'register':
			state.revision = message.detail.revision;
			break;

		// Handle individual renderer observation
		case 'renderer':
			const detail = message.detail;

			// Only store each unique object once
			if ( ! state.objects.has( detail.uuid ) ) {

				state.objects.set( detail.uuid, detail );
				state.renderers.set( detail.uuid, detail );

			}

			// Update or add the renderer in the state map
			state.renderers.set( detail.uuid, detail ); // Ensure the latest detail is always stored
			// Also update the generic objects map if renderers are stored there too
			state.objects.set( detail.uuid, detail );

			// The DOM update logic previously here is redundant because updateUI()
			// rebuilds the entire renderer element anyway, using the updated data
			// from state.renderers and the persisted open/closed state.

			break;

		// Handle a batch of objects for a specific scene
		case 'scene':
			const { sceneUuid, objects: batchObjects } = message.detail;
			console.log( 'Panel: Received scene batch for', sceneUuid, 'with', batchObjects.length, 'objects' );

			// 1. Identify UUIDs in the new batch
			const newObjectUuids = new Set( batchObjects.map( obj => obj.uuid ) );

			// 2. Identify current object UUIDs associated with this scene that are NOT renderers
			const currentSceneObjectUuids = new Set();
			state.objects.forEach( ( obj, uuid ) => {

				// Use the _sceneUuid property we'll add below, or check if it's the scene root itself
				if ( obj._sceneUuid === sceneUuid || uuid === sceneUuid ) {

					currentSceneObjectUuids.add( uuid );

				}

			} );

			// 3. Find UUIDs to remove (in current state for this scene, but not in the new batch)
			const uuidsToRemove = new Set();
			currentSceneObjectUuids.forEach( uuid => {

				if ( ! newObjectUuids.has( uuid ) ) {

					uuidsToRemove.add( uuid );

				}

			} );

			// 4. Remove stale objects from state
			uuidsToRemove.forEach( uuid => {

				state.objects.delete( uuid );
				// If a scene object itself was somehow removed (unlikely for root), clean up scenes map too
				if ( state.scenes.has( uuid ) ) {

					state.scenes.delete( uuid );

				}

			} );

			// 5. Process the new batch: Add/Update objects and mark their scene association
			batchObjects.forEach( objData => {

				// Add a private property to track which scene this object belongs to
				objData._sceneUuid = sceneUuid;
				state.objects.set( objData.uuid, objData );

				// Ensure the scene root is in the scenes map
				if ( objData.isScene && objData.uuid === sceneUuid ) {

					state.scenes.set( objData.uuid, objData );

				}
				// Note: Renderers are handled separately by 'renderer' events and shouldn't appear in scene batches.

			} );

			break;

		case 'committed':
			// Page was reloaded, clear state
			clearState();
			break;

		case 'export-started':
			console.log( '[Panel] Export started:', message.detail );
			state.exportStatus.set( getSceneUuidFromMessage( message ), 'Export started...' );
			break;

		case 'export-file-generated':
			console.log( '[Panel] Export file generated:', message.detail );
			state.exportStatus.set( getSceneUuidFromMessage( message ), 'File generated.' );
			break;

		case 'export-download-initiated':
			console.log( '[Panel] Export download initiated:', message.detail );
			state.exportStatus.set( getSceneUuidFromMessage( message ), 'Download initiated.' );
			break;

		case 'export-complete':
			console.log( '[Panel] Export complete:', message.detail );
			state.exportStatus.set( getSceneUuidFromMessage( message ), 'Export complete!' );
			if ( getSceneUuidFromMessage( message ) ) {

				setTimeout( () => {

					state.exportStatus.set( getSceneUuidFromMessage( message ), '' );
					updateUI();

				}, 5000 );

			}

			break;

		case 'export-error':
			console.warn( '[Panel] Export error:', message.detail );
			state.exportStatus.set( getSceneUuidFromMessage( message ), 'Export error.' );
			if ( message.detail && message.detail.error ) {

				console.error( 'Panel: Export error:', message.detail.error );
				// Optionally: alert( 'Export failed: ' + message.detail.error );

			}

			break;

		case 'export-result':
			// This message is typically used to indicate the export result
			console.log( '[Panel] Export result:', message.detail );
			if ( getSceneUuidFromMessage( message ) && getSuccessFromMessage( message ) ) {

				state.exportStatus.set( getSceneUuidFromMessage( message ), 'Export complete!' );

			}

			break;

		case 'export-result-meta':
			// This message is typically used to provide metadata about the export result
			// It may not require any specific UI updates, but we can log it if needed
			console.log( 'Panel: Received export result metadata:', message.detail );
			// If you want to update the UI with this metadata, you can do so here
			break;

		default:
			console.warn( '[Panel] Unhandled message:', message.name, message.detail );
			// You can handle other messages here if needed
			break;

	}

	updateUI();

}

function renderRenderer( obj, container ) {

	// Create <details> element as the main container
	const detailsElement = document.createElement( 'details' );
	detailsElement.className = 'renderer-container';
	detailsElement.setAttribute( 'data-uuid', obj.uuid );

	// Set initial state
	detailsElement.open = rendererCollapsedState.get( obj.uuid ) || false;

	// Add toggle listener to save state
	detailsElement.addEventListener( 'toggle', () => {

		rendererCollapsedState.set( obj.uuid, detailsElement.open );

	} );

	// Create the summary element (clickable header) - THIS IS THE FIRST CHILD
	const summaryElem = document.createElement( 'summary' ); // USE <summary> tag
	summaryElem.className = 'tree-item renderer-summary'; // Acts as summary

	// Update display name in the summary line
	const props = obj.properties;
	const details = [ `${props.width}x${props.height}` ];
	if ( props.info ) {

		details.push( `${props.info.render.calls} draws` );
		details.push( `${props.info.render.triangles.toLocaleString()} triangles` );

	}

	const displayName = `${obj.type} <span class="object-details">${details.join( ' ・ ' )}</span>`;

	// Use toggle icon instead of paint icon
	summaryElem.innerHTML = `<span class="icon toggle-icon"></span>
		<span class="label">${displayName}</span>
		<span class="type">${obj.type}</span>`;
	detailsElement.appendChild( summaryElem );

	const propsContainer = document.createElement( 'div' );
	propsContainer.className = 'properties-list';
	// Adjust padding calculation if needed, ensure it's a number before adding
	const summaryPaddingLeft = parseFloat( summaryElem.style.paddingLeft ) || 0;
	propsContainer.style.paddingLeft = `${summaryPaddingLeft + 20}px`; // Indent further

	propsContainer.innerHTML = ''; // Clear placeholder

	if ( obj.properties ) {

		const props = obj.properties;
		const info = props.info || { render: {}, memory: {} }; // Default empty objects if info is missing

		const gridContainer = document.createElement( 'div' );
		gridContainer.style.display = 'grid';
		gridContainer.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))'; // Responsive columns
		gridContainer.style.gap = '10px 20px'; // Row and column gap

		// --- Column 1: Properties ---
		const propsCol = document.createElement( 'div' );
		propsCol.className = 'properties-column';
		const propsTitle = document.createElement( 'h4' );
		propsTitle.textContent = 'Properties';
		propsCol.appendChild( propsTitle );
		propsCol.appendChild( createPropertyRow( 'Size', `${props.width}x${props.height}` ) );
		propsCol.appendChild( createPropertyRow( 'Alpha', props.alpha ) );
		propsCol.appendChild( createPropertyRow( 'Antialias', props.antialias ) );
		propsCol.appendChild( createPropertyRow( 'Output Color Space', props.outputColorSpace ) );
		propsCol.appendChild( createPropertyRow( 'Tone Mapping', props.toneMapping ) );
		propsCol.appendChild( createPropertyRow( 'Tone Mapping Exposure', props.toneMappingExposure ) );
		propsCol.appendChild( createPropertyRow( 'Shadows', props.shadows ? 'enabled' : 'disabled' ) ); // Display string
		propsCol.appendChild( createPropertyRow( 'Auto Clear', props.autoClear ) );
		propsCol.appendChild( createPropertyRow( 'Auto Clear Color', props.autoClearColor ) );
		propsCol.appendChild( createPropertyRow( 'Auto Clear Depth', props.autoClearDepth ) );
		propsCol.appendChild( createPropertyRow( 'Auto Clear Stencil', props.autoClearStencil ) );
		propsCol.appendChild( createPropertyRow( 'Local Clipping', props.localClipping ) );
		propsCol.appendChild( createPropertyRow( 'Physically Correct Lights', props.physicallyCorrectLights ) );
		gridContainer.appendChild( propsCol );

		// --- Column 2: Render Stats & Memory ---
		const statsCol = document.createElement( 'div' );
		statsCol.className = 'stats-column';

		// Render Stats
		const renderTitle = document.createElement( 'h4' );
		renderTitle.textContent = 'Render Stats';
		statsCol.appendChild( renderTitle );
		statsCol.appendChild( createPropertyRow( 'Frame', info.render.frame ) );
		statsCol.appendChild( createPropertyRow( 'Draw Calls', info.render.calls ) );
		statsCol.appendChild( createPropertyRow( 'Triangles', info.render.triangles ) );
		statsCol.appendChild( createPropertyRow( 'Points', info.render.points ) );
		statsCol.appendChild( createPropertyRow( 'Lines', info.render.lines ) );

		// Memory
		const memoryTitle = document.createElement( 'h4' );
		memoryTitle.textContent = 'Memory';
		memoryTitle.style.marginTop = '10px'; // Add space before Memory section
		statsCol.appendChild( memoryTitle );
		statsCol.appendChild( createPropertyRow( 'Geometries', info.memory.geometries ) ); // Memory Geometries
		statsCol.appendChild( createPropertyRow( 'Textures', info.memory.textures ) );
		statsCol.appendChild( createPropertyRow( 'Shader Programs', info.memory.programs ) );

		gridContainer.appendChild( statsCol );
		propsContainer.appendChild( gridContainer );

	} else {

		propsContainer.textContent = 'No properties available.';

	}

	detailsElement.appendChild( propsContainer );

	container.appendChild( detailsElement ); // Append details to the main container

}

// Function to render an object and its children
function renderObject( obj, container, level = 0 ) {

	const icon = getObjectIcon( obj );
	let displayName = obj.name || obj.type;

	// Default rendering for other object types
	const elem = document.createElement( 'div' );
	elem.className = 'tree-item';
	elem.style.paddingLeft = `${level * 20}px`;
	elem.setAttribute( 'data-uuid', obj.uuid );

	let labelContent = `<span class="icon">${icon}</span>
		<span class="label">${displayName}</span>
		<span class="type">${obj.type}</span>`;

	if ( obj.isScene ) {

		// Add object count for scenes
		let objectCount = - 1;
		function countObjects( uuid ) {

			const object = state.objects.get( uuid );
			if ( object ) {

				objectCount ++; // Increment count for the object itself
				if ( object.children ) {

					object.children.forEach( childId => countObjects( childId ) );

				}

			}

		}

		countObjects( obj.uuid );
		displayName = `${obj.name || obj.type} <span class="object-details">${objectCount} objects</span>`;
		labelContent = `<span class="icon">${icon}</span>
			<span class="label">${displayName}</span>
			<span class="export-scene-buttons"></span>
			<span class="type">${obj.type}</span>`;

	}

	elem.innerHTML = labelContent;

	// Add export buttons for scenes
	if ( obj.isScene ) {

		const btnGltf = document.createElement( 'button' );
		btnGltf.textContent = '💾 GLTF';
		btnGltf.onclick = () => {

			btnGltf.disabled = true;
			btnGlb.disabled = true;
			backgroundPageConnection.postMessage( { name: 'export-scene', sceneUuid: obj.uuid, binary: false } );
			console.log( 'Panel: Exporting scene as GLTF:', obj.uuid );

		};

		const btnGlb = document.createElement( 'button' );
		btnGlb.textContent = '💾 GLB';
		btnGlb.onclick = () => {

			btnGltf.disabled = true;
			btnGlb.disabled = true;
			backgroundPageConnection.postMessage( { name: 'export-scene', sceneUuid: obj.uuid, binary: true } );
			console.log( 'Panel: Exporting scene as GLB:', obj.uuid );

		};

		if ( ! state.exportSceneBtns ) state.exportSceneBtns = new Map();
		state.exportSceneBtns.set( obj.uuid, { btnGltf, btnGlb } );

		const exportBtnSpan = elem.querySelector( '.export-scene-buttons' );
		if ( exportBtnSpan ) {

			exportBtnSpan.style.display = 'inline-flex';
			exportBtnSpan.style.gap = '6px';
			exportBtnSpan.appendChild( btnGltf );
			exportBtnSpan.appendChild( btnGlb );

			// Add status indicator
			let statusElem = exportBtnSpan.querySelector( '.export-status' );

			if ( ! statusElem ) {

				statusElem = document.createElement( 'span' );
				statusElem.className = 'export-status';
				statusElem.style.marginLeft = '8px';
				exportBtnSpan.appendChild( statusElem );

			}

			const status = state.exportStatus && state.exportStatus.get( obj.uuid );

			statusElem.textContent = status || '';

		}

	}

	container.appendChild( elem );

	// Handle children (excluding children of renderers, as properties are shown in details)
	if ( ! obj.isRenderer && obj.children && obj.children.length > 0 ) {

		// Create a container for children
		const childContainer = document.createElement( 'div' );
		childContainer.className = 'children';
		container.appendChild( childContainer );

		// Get all children and sort them by type for better organization
		const children = obj.children
			.map( childId => state.objects.get( childId ) )
			.filter( child => child !== undefined )
			.sort( ( a, b ) => {

				// Sort order: Cameras, Lights, Groups, Meshes, Others
				const typeOrder = {
					isCamera: 1,
					isLight: 2,
					isGroup: 3,
					isMesh: 4
				};
				// Refactored to avoid optional chaining parser error
				const findOrder = ( obj ) => {

					const entry = Object.entries( typeOrder ).find( ( [ key ] ) => obj[ key ] );
					return entry ? entry[ 1 ] : 5; // Check if entry exists, then access index 1 (value)

				};

				const aOrder = findOrder( a );
				const bOrder = findOrder( b );

				return aOrder - bOrder;

			} );

		// Render each child
		children.forEach( child => {

			renderObject( child, childContainer, level + 1 );

		} );

	}

}



// Function to update the UI
function updateUI() {

	const container = document.getElementById( 'scene-tree' );
	container.innerHTML = '';

	const header = document.createElement( 'div' );
	header.className = 'header';
	header.style.display = 'flex'; // Use flexbox
	header.style.justifyContent = 'space-between'; // Align items left and right

	const miscSpan = document.createElement( 'span' );
	miscSpan.className = 'misc-header';
	miscSpan.style.display = 'flex'; // Use flexbox for the misc section
	miscSpan.style.width = '100%'; // Ensure it takes full width
	miscSpan.style.justifyContent = 'space-between'; // Align items within misc section
	// Add "Update UI" button and feedback link
	// const updateBtn = document.createElement('button');
	// updateBtn.textContent = '🖥️';
	// updateBtn.title = 'Update UI';
	// updateBtn.onclick = () => updateUI();
	// updateBtn.style.marginRight = '10px';

	const feedbackLink = document.createElement( 'a' );
	feedbackLink.href = 'https://docs.google.com/forms/d/e/1FAIpQLSdw1QcgXNiECYiPx6k0vSQRiRe0FmByrrojV4fgeL5zzXIiCw/viewform?usp=preview';
	feedbackLink.target = '_blank';
	feedbackLink.textContent = '+';


	miscSpan.appendChild( feedbackLink );
	//miscSpan.appendChild(updateBtn);

	const manifest = chrome.runtime.getManifest();

	const manifestVersionSpan = document.createElement( 'span' );
	manifestVersionSpan.textContent = `${manifest.version}`;
	manifestVersionSpan.style.opacity = '0.5'; // Make it less prominent

	header.appendChild( miscSpan );
	header.appendChild( manifestVersionSpan );

	container.appendChild( header );

	// Add renderers section
	if ( state.renderers.size > 0 ) {

		const renderersSection = document.createElement( 'div' );
		renderersSection.className = 'section';
		renderersSection.innerHTML = '<h3>Renderers</h3>';

		state.renderers.forEach( renderer => {

			renderRenderer( renderer, renderersSection );

		} );

		container.appendChild( renderersSection );

	}

	// Add scenes section
	if ( state.scenes.size > 0 ) {

		const scenesSection = document.createElement( 'div' );
		scenesSection.className = 'section';
		scenesSection.innerHTML = '<h3>Scenes</h3>';

		state.scenes.forEach( scene => {

			renderObject( scene, scenesSection );

		} );

		container.appendChild( scenesSection );

	}

}

// Add a map to track export status per scene
state.exportStatus = new Map();



// Initial UI update
clearState();
updateUI();

// Helper to extract sceneUuid from message
function getSceneUuidFromMessage( message ) {

	if ( message.sceneUuid ) return message.sceneUuid;

	if ( message.detail && message.detail.sceneUuid ) return message.detail.sceneUuid;

	if ( message.detail && Array.isArray( message.detail.properties ) ) {

		const prop = message.detail.properties.find( p => p.name === 'sceneUuid' );

		if ( prop && prop.value ) return prop.value;

	}

	return undefined;

}

// Helper to extract success from message
function getSuccessFromMessage( message ) {

	if ( message.detail && typeof message.detail.success === 'boolean' ) return message.detail.success;

	if ( message.detail && Array.isArray( message.detail.properties ) ) {

		const prop = message.detail.properties.find( p => p.name === 'success' );
		if ( prop ) return prop.value;

	}

	return false;

}

