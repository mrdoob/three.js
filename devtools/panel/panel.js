/* global chrome */

// Constants
const MESSAGE_ID = 'three-devtools';
const CONNECTION_NAME = 'three-devtools';
const MESSAGE_INIT = 'init';
const MESSAGE_REQUEST_STATE = 'request-state';
const MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
const MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
const EVENT_REGISTER = 'register';
const EVENT_RENDERER = 'renderer';
const EVENT_OBJECT_DETAILS = 'object-details';
const EVENT_SCENE = 'scene';
const EVENT_COMMITTED = 'committed';
const STATE_POLLING_INTERVAL = 1000;

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
	labelSpan.textContent = `${label}`;
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

function createVectorRow( label, vector ) {

	const row = document.createElement( 'div' );
	row.className = 'property-row';
	row.style.marginBottom = '2px';

	// Pad label to ensure consistent alignment
	const paddedLabel = label.padEnd( 16, ' ' ); // Pad to 16 characters
	const content = `${paddedLabel} ${vector.x.toFixed( 3 )}\t${vector.y.toFixed( 3 )}\t${vector.z.toFixed( 3 )}`;
	row.textContent = content;
	row.style.fontFamily = 'monospace';
	row.style.whiteSpace = 'pre';

	return row;

}

// --- State ---
const state = {
	revision: null,
	scenes: new Map(),
	renderers: new Map(),
	objects: new Map(),
	selectedObject: null
};

// Floating details panel
let floatingPanel = null;
let mousePosition = { x: 0, y: 0 };


// Create a connection to the background page
const backgroundPageConnection = chrome.runtime.connect( {
	name: CONNECTION_NAME
} );

// Initialize the connection with the inspected tab ID
backgroundPageConnection.postMessage( {
	name: MESSAGE_INIT,
	tabId: chrome.devtools.inspectedWindow.tabId
} );

// Request the initial state from the bridge script
backgroundPageConnection.postMessage( {
	name: MESSAGE_REQUEST_STATE,
	tabId: chrome.devtools.inspectedWindow.tabId
} );

// Function to scroll to canvas element
function scrollToCanvas( rendererUuid ) {
	backgroundPageConnection.postMessage( {
		name: MESSAGE_SCROLL_TO_CANVAS,
		uuid: rendererUuid,
		tabId: chrome.devtools.inspectedWindow.tabId
	} );
}

const intervalId = setInterval( () => {

	backgroundPageConnection.postMessage( {
		name: MESSAGE_REQUEST_STATE,
		tabId: chrome.devtools.inspectedWindow.tabId
	} );

}, STATE_POLLING_INTERVAL );

backgroundPageConnection.onDisconnect.addListener( () => {

	console.log( 'Panel: Connection to background page lost' );
	clearInterval( intervalId );
	clearState();

} );

// Function to request object details from the bridge
function requestObjectDetails( uuid ) {
	backgroundPageConnection.postMessage( {
		name: MESSAGE_REQUEST_OBJECT_DETAILS,
		uuid: uuid,
		tabId: chrome.devtools.inspectedWindow.tabId
	} );
}


// Store renderer collapse states
const rendererCollapsedState = new Map();

// Helper function to create properties column for renderer
function createRendererPropertiesColumn( props ) {

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
	propsCol.appendChild( createPropertyRow( 'Shadows', props.shadows ? 'enabled' : 'disabled' ) );
	propsCol.appendChild( createPropertyRow( 'Auto Clear', props.autoClear ) );
	propsCol.appendChild( createPropertyRow( 'Auto Clear Color', props.autoClearColor ) );
	propsCol.appendChild( createPropertyRow( 'Auto Clear Depth', props.autoClearDepth ) );
	propsCol.appendChild( createPropertyRow( 'Auto Clear Stencil', props.autoClearStencil ) );
	propsCol.appendChild( createPropertyRow( 'Local Clipping', props.localClipping ) );
	propsCol.appendChild( createPropertyRow( 'Physically Correct Lights', props.physicallyCorrectLights ) );

	return propsCol;

}

// Helper function to create stats column for renderer
function createRendererStatsColumn( info ) {

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
	memoryTitle.style.marginTop = '10px';
	statsCol.appendChild( memoryTitle );
	statsCol.appendChild( createPropertyRow( 'Geometries', info.memory.geometries ) );
	statsCol.appendChild( createPropertyRow( 'Textures', info.memory.textures ) );
	statsCol.appendChild( createPropertyRow( 'Shader Programs', info.memory.programs ) );

	return statsCol;

}

// Helper function to process scene batch updates
function processSceneBatch( sceneUuid, batchObjects ) {

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

}

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

	// Hide floating panel
	if ( floatingPanel ) {

		floatingPanel.classList.remove( 'visible' );

	}

}

// Listen for messages from the background page
backgroundPageConnection.onMessage.addListener( function ( message ) {

	if ( message.id === MESSAGE_ID ) {

		handleThreeEvent( message );

	}

} );

function handleThreeEvent( message ) {

	switch ( message.name ) {

		case EVENT_REGISTER:
			state.revision = message.detail.revision;
			break;

		// Handle individual renderer observation
		case EVENT_RENDERER:
			const detail = message.detail;

			// Update or add the renderer in the state maps (always use latest data)
			state.renderers.set( detail.uuid, detail );
			state.objects.set( detail.uuid, detail );

			break;

		// Handle object details response
		case EVENT_OBJECT_DETAILS:
			state.selectedObject = message.detail;
			console.log( 'Panel: Received object details:', message.detail );
			showFloatingDetails( message.detail );
			break;

		// Handle a batch of objects for a specific scene
		case EVENT_SCENE:
			const { sceneUuid, objects: batchObjects } = message.detail;
			console.log( 'Panel: Received scene batch for', sceneUuid, 'with', batchObjects.length, 'objects' );
			processSceneBatch( sceneUuid, batchObjects );
			break;

		case EVENT_COMMITTED:
			// Page was reloaded, clear state
			clearState();
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
	const scrollButton = obj.canvasInDOM ? 
		`<button class="scroll-to-canvas-btn" data-canvas-uuid="${obj.uuid}" title="Scroll to canvas">🙂</button>` : 
		`<span class="scroll-to-canvas-placeholder" title="Canvas not in DOM">󠀠🫥</span>`;
	summaryElem.innerHTML = `<span class="icon toggle-icon"></span> 
		<span class="label">${displayName}</span>
		<span class="type">${obj.type}</span>
		${scrollButton}`;
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

		gridContainer.appendChild( createRendererPropertiesColumn( props ) );
		gridContainer.appendChild( createRendererStatsColumn( info ) );
		propsContainer.appendChild( gridContainer );

	} else {

		propsContainer.textContent = 'No properties available.';

	}

	detailsElement.appendChild( propsContainer );

	// Add click handler for scroll to canvas button
	const scrollBtn = detailsElement.querySelector( '.scroll-to-canvas-btn' );
	if ( scrollBtn ) {
		scrollBtn.addEventListener( 'click', ( event ) => {
			event.preventDefault();
			event.stopPropagation();
			scrollToCanvas( obj.uuid );
		} );
	}

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
			<span class="type">${obj.type}</span>`;

	}

	elem.innerHTML = labelContent;
	
	// Add mouseover handler to request object details
	elem.addEventListener( 'mouseover', ( event ) => {
		event.stopPropagation(); // Prevent bubbling to parent elements
		requestObjectDetails( obj.uuid );
	} );
	
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

				const getTypeOrder = ( obj ) => {
					if ( obj.isCamera ) return 1;
					if ( obj.isLight ) return 2;
					if ( obj.isGroup ) return 3;
					if ( obj.isMesh ) return 4;
					return 5;
				};

				const aOrder = getTypeOrder( a );
				const bOrder = getTypeOrder( b );

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
	miscSpan.innerHTML = '<a href="https://docs.google.com/forms/d/e/1FAIpQLSdw1QcgXNiECYiPx6k0vSQRiRe0FmByrrojV4fgeL5zzXIiCw/viewform?usp=preview" target="_blank">+</a>';

	const manifest = chrome.runtime.getManifest();

	const manifestVersionSpan = document.createElement( 'span' );
	manifestVersionSpan.textContent = `${manifest.version}`;
	manifestVersionSpan.style.opacity = '0.5'; // Make it less prominent

	header.appendChild( miscSpan );
	header.appendChild( manifestVersionSpan );

	container.appendChild( header );

	const hasRenderers = state.renderers.size > 0;
	const hasScenes = state.scenes.size > 0;

	// Create sections container if both renderers and scenes exist (for responsive layout)
	let sectionsContainer = container;
	if ( hasRenderers && hasScenes ) {

		sectionsContainer = document.createElement( 'div' );
		sectionsContainer.className = 'sections-container';
		container.appendChild( sectionsContainer );

	}

	// Add renderers section
	if ( hasRenderers ) {

		const renderersSection = document.createElement( 'div' );
		renderersSection.className = 'section';
		renderersSection.innerHTML = '<h3>Renderers</h3>';

		state.renderers.forEach( renderer => {

			renderRenderer( renderer, renderersSection );

		} );

		sectionsContainer.appendChild( renderersSection );

	}

	// Add scenes section
	if ( hasScenes ) {

		const scenesSection = document.createElement( 'div' );
		scenesSection.className = 'section';
		scenesSection.innerHTML = '<h3>Scenes</h3>';

		state.scenes.forEach( scene => {

			renderObject( scene, scenesSection );

		} );

		sectionsContainer.appendChild( scenesSection );

	}


}

// Create floating details panel
function createFloatingPanel() {

	if ( floatingPanel ) return floatingPanel;

	floatingPanel = document.createElement( 'div' );
	floatingPanel.className = 'floating-details';
	document.body.appendChild( floatingPanel );

	return floatingPanel;

}

// Show floating details panel
function showFloatingDetails( objectData ) {

	const panel = createFloatingPanel();
	
	// Clear previous content
	panel.innerHTML = '';
	
	if ( objectData.position ) {

		panel.appendChild( createVectorRow( 'Position', objectData.position ) );

	}

	if ( objectData.rotation ) {

		panel.appendChild( createVectorRow( 'Rotation', objectData.rotation ) );

	}

	if ( objectData.scale ) {

		panel.appendChild( createVectorRow( 'Scale', objectData.scale ) );

	}

	// Position panel near mouse
	updateFloatingPanelPosition();
	
	// Show panel
	panel.classList.add( 'visible' );

}

// Update floating panel position
function updateFloatingPanelPosition() {

	if ( ! floatingPanel || ! floatingPanel.classList.contains( 'visible' ) ) return;

	const offset = 15; // Offset from cursor
	let x = mousePosition.x + offset;
	let y = mousePosition.y + offset;

	// Prevent panel from going off-screen
	const panelRect = floatingPanel.getBoundingClientRect();
	const maxX = window.innerWidth - panelRect.width - 10;
	const maxY = window.innerHeight - panelRect.height - 10;

	if ( x > maxX ) x = mousePosition.x - panelRect.width - offset;
	if ( y > maxY ) y = mousePosition.y - panelRect.height - offset;

	floatingPanel.style.left = `${Math.max( 10, x )}px`;
	floatingPanel.style.top = `${Math.max( 10, y )}px`;

}

// Track mouse position
document.addEventListener( 'mousemove', ( event ) => {

	mousePosition.x = event.clientX;
	mousePosition.y = event.clientY;
	updateFloatingPanelPosition();

} );

// Hide panel when mouse leaves the tree area
document.addEventListener( 'mouseover', ( event ) => {

	if ( floatingPanel && ! event.target.closest( '.tree-item' ) ) {

		floatingPanel.classList.remove( 'visible' );

	}

} );

// Initial UI update
clearState();
updateUI();
