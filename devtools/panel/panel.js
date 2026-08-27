/* global chrome, MESSAGE_ID, MESSAGE_INIT, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, EVENT_RENDERER, EVENT_OBJECT_DETAILS, EVENT_SCENE, EVENT_SCENE_REMOVED, EVENT_COMMITTED */

const STATE_POLLING_INTERVAL = 1000;

// --- State ---

const state = {
	scenes: new Map(),
	renderers: new Map(),
	objects: new Map()
};

// Open/closed state of collapsible nodes (uuid -> boolean), kept across rebuilds
const openState = new Map();

// Static DOM elements (created once in initUI)
let renderersSection = null;
let scenesSection = null;
let floatingPanel = null;

const mousePosition = { x: 0, y: 0 };

// --- Connection ---

const port = chrome.runtime.connect();
const intervalId = setInterval( () => send( MESSAGE_REQUEST_STATE ), STATE_POLLING_INTERVAL );

function send( name, data ) {

	try {

		port.postMessage( { name: name, ...data } );

	} catch ( error ) {

		// Extension reloaded under an open panel, chrome.runtime is gone
		clearInterval( intervalId );

	}

}

send( MESSAGE_INIT, { tabId: chrome.devtools.inspectedWindow.tabId } );
send( MESSAGE_REQUEST_STATE );

port.onDisconnect.addListener( () => {

	clearInterval( intervalId );
	clearState();

} );

port.onMessage.addListener( ( message ) => {

	if ( message.id !== MESSAGE_ID ) return;

	const detail = message.detail;

	switch ( message.name ) {

		case EVENT_RENDERER:
			detail._frameId = message.frameId;
			state.renderers.set( detail.uuid, detail );
			updateRenderers();
			break;

		case EVENT_OBJECT_DETAILS:
			showFloatingDetails( detail );
			break;

		case EVENT_SCENE:
			processSceneBatch( detail.sceneUuid, detail.objects, message.frameId );
			updateSceneTree();
			break;

		case EVENT_SCENE_REMOVED:
			removeScene( detail.uuid );
			updateSceneTree();
			break;

		case EVENT_COMMITTED:
			// A top-level navigation replaces every frame
			if ( message.frameId === 0 ) clearState(); else removeFrame( message.frameId );
			updateRenderers();
			updateSceneTree();
			break;

	}

} );

// Replace the objects of a scene with a new batch from the bridge
function processSceneBatch( sceneUuid, objects, frameId ) {

	const uuids = new Set( objects.map( object => object.uuid ) );

	// Drop objects that are no longer in the scene
	state.objects.forEach( ( object, uuid ) => {

		if ( object._sceneUuid === sceneUuid && ! uuids.has( uuid ) ) {

			state.objects.delete( uuid );
			openState.delete( uuid );

		}

	} );

	for ( const object of objects ) {

		object._sceneUuid = sceneUuid;
		state.objects.set( object.uuid, object );

	}

	const scene = state.objects.get( sceneUuid );
	scene._frameId = frameId;
	state.scenes.set( sceneUuid, scene );

}

// Drop a scene and all of its objects (the bridge has determined it was disposed)
function removeScene( sceneUuid ) {

	state.scenes.delete( sceneUuid );

	state.objects.forEach( ( object, uuid ) => {

		if ( object._sceneUuid === sceneUuid ) {

			state.objects.delete( uuid );
			openState.delete( uuid );

		}

	} );

}

// Drop the renderers and scenes of a sub-frame that navigated
function removeFrame( frameId ) {

	state.renderers.forEach( ( renderer, uuid ) => {

		if ( renderer._frameId === frameId ) {

			state.renderers.delete( uuid );
			openState.delete( uuid );

		}

	} );

	state.scenes.forEach( ( scene, uuid ) => {

		if ( scene._frameId === frameId ) removeScene( uuid );

	} );

}

// Clear state when the page navigates or the connection drops
function clearState() {

	state.scenes.clear();
	state.renderers.clear();
	state.objects.clear();
	openState.clear();

	floatingPanel.classList.remove( 'visible' );

}

// --- Rendering ---

function getObjectIcon( obj ) {

	if ( obj.isScene ) return '🌍';
	if ( obj.isCamera ) return '📷';
	if ( obj.isLight ) return '💡';
	if ( obj.isInstancedMesh ) return '🔸';
	if ( obj.isMesh ) return '🔷';
	if ( obj.isGroup ) return '📁';
	return '📦';

}

// Sort order of children in the tree
function getObjectOrder( obj ) {

	if ( obj.isCamera ) return 1;
	if ( obj.isLight ) return 2;
	if ( obj.isGroup ) return 3;
	if ( obj.isMesh ) return 4;
	return 5;

}

function createLabel( name, details ) {

	if ( details.length === 0 ) return name;

	return `${name} <span class="object-details">${details.join( ' ・ ' )}</span>`;

}

function createPropertyRow( label, value ) {

	const row = document.createElement( 'div' );
	row.className = 'property-row';

	const labelSpan = document.createElement( 'span' );
	labelSpan.className = 'property-label';
	labelSpan.textContent = label;

	const valueSpan = document.createElement( 'span' );
	valueSpan.className = 'property-value';
	valueSpan.textContent = ( value === undefined || value === null )
		? '–'
		: ( typeof value === 'number' ? value.toLocaleString() : value );

	row.appendChild( labelSpan );
	row.appendChild( valueSpan );
	return row;

}

// A titled group of property rows
function createPropertyGroup( title, rows ) {

	const fragment = document.createDocumentFragment();

	const heading = document.createElement( 'h4' );
	heading.textContent = title;
	fragment.appendChild( heading );

	for ( const [ label, value ] of rows ) {

		fragment.appendChild( createPropertyRow( label, value ) );

	}

	return fragment;

}

function createVectorRow( label, vector ) {

	const row = document.createElement( 'div' );
	row.className = 'vector-row';

	// Pad label to ensure consistent alignment
	const paddedLabel = label.padEnd( 16 );
	row.textContent = `${paddedLabel} ${vector.x.toFixed( 3 )}\t${vector.y.toFixed( 3 )}\t${vector.z.toFixed( 3 )}`;

	return row;

}

function renderRenderer( renderer, container ) {

	const props = renderer.properties;
	const info = props.info;

	const node = document.createElement( 'details' );
	node.open = openState.get( renderer.uuid ) ?? false;
	node.addEventListener( 'toggle', () => openState.set( renderer.uuid, node.open ) );

	const label = createLabel( renderer.type, [
		`${props.width}x${props.height}`,
		`${info.render.calls} draws`,
		`${info.render.triangles.toLocaleString()} triangles`
	] );

	const scrollButton = renderer.canvasInDOM
		? '<button class="scroll-to-canvas-btn" title="Scroll to canvas">🙂</button>'
		: '<span class="scroll-to-canvas-placeholder" title="Canvas not in DOM">🫥</span>';

	const summary = document.createElement( 'summary' );
	summary.className = 'tree-item';
	summary.innerHTML = `<span class="tree-toggle"></span><span class="label">${label}</span>${scrollButton}`;
	node.appendChild( summary );

	const button = summary.querySelector( '.scroll-to-canvas-btn' );

	if ( button !== null ) {

		button.addEventListener( 'click', () => send( MESSAGE_SCROLL_TO_CANVAS, { uuid: renderer.uuid } ) );

	}

	const propertiesColumn = document.createElement( 'div' );
	propertiesColumn.appendChild( createPropertyGroup( 'Properties', [
		[ 'Size', `${props.width}x${props.height}` ],
		[ 'Alpha', props.alpha ],
		[ 'Antialias', props.antialias ],
		[ 'Output Color Space', props.outputColorSpace ],
		[ 'Tone Mapping', props.toneMapping ],
		[ 'Tone Mapping Exposure', props.toneMappingExposure ],
		[ 'Shadows', props.shadows ? 'enabled' : 'disabled' ],
		[ 'Auto Clear', props.autoClear ],
		[ 'Auto Clear Color', props.autoClearColor ],
		[ 'Auto Clear Depth', props.autoClearDepth ],
		[ 'Auto Clear Stencil', props.autoClearStencil ],
		[ 'Local Clipping', props.localClipping ]
	] ) );

	const statsColumn = document.createElement( 'div' );
	statsColumn.appendChild( createPropertyGroup( 'Render Stats', [
		[ 'Frame', info.render.frame ],
		[ 'Draw Calls', info.render.calls ],
		[ 'Triangles', info.render.triangles ],
		[ 'Points', info.render.points ],
		[ 'Lines', info.render.lines ]
	] ) );
	statsColumn.appendChild( createPropertyGroup( 'Memory', [
		[ 'Geometries', info.memory.geometries ],
		[ 'Textures', info.memory.textures ],
		[ 'Shader Programs', info.memory.programs ]
	] ) );

	const properties = document.createElement( 'div' );
	properties.className = 'properties-list';
	properties.appendChild( propertiesColumn );
	properties.appendChild( statsColumn );
	node.appendChild( properties );

	container.appendChild( node );

}

// Render an object and its children
function renderObject( obj, container, level = 0, parentInvisible = false ) {

	const children = obj.children
		.map( uuid => state.objects.get( uuid ) )
		.filter( child => child !== undefined )
		.sort( ( a, b ) => getObjectOrder( a ) - getObjectOrder( b ) );

	const hasChildren = children.length > 0;
	const invisible = parentInvisible || obj.visible === false;

	let name = obj.name || obj.type;
	const details = [];

	if ( obj.isInstancedMesh ) name += ` [${obj.count}]`;
	if ( obj.isMesh ) details.push( `${obj.geometryType} ${obj.materialType}` );

	if ( obj.isScene ) {

		let objectCount = 0;
		let lightCount = 0;

		state.objects.forEach( object => {

			if ( object._sceneUuid !== obj.uuid || object.isScene ) return;

			objectCount ++;
			if ( object.isLight ) lightCount ++;

		} );

		details.push( `${objectCount} objects` );
		if ( lightCount > 0 ) details.push( `${lightCount} lights` );

	}

	const toggle = hasChildren
		? '<span class="tree-toggle"></span>'
		: '<span class="tree-toggle-placeholder"></span>';

	const item = document.createElement( hasChildren ? 'summary' : 'div' );
	item.className = 'tree-item';
	item.style.paddingLeft = `${level * 20}px`;
	if ( invisible ) item.classList.add( 'invisible' );
	item.innerHTML = `${toggle}<span class="icon">${getObjectIcon( obj )}</span>
		<span class="label">${createLabel( name, details )}</span>
		<span class="type">${obj.type}</span>`;

	item.addEventListener( 'mouseenter', () => {

		send( MESSAGE_REQUEST_OBJECT_DETAILS, { uuid: obj.uuid } );

		// Only highlight if object and all parents are visible
		if ( ! invisible ) send( MESSAGE_HIGHLIGHT_OBJECT, { uuid: obj.uuid } );

	} );

	item.addEventListener( 'mouseleave', () => send( MESSAGE_UNHIGHLIGHT_OBJECT ) );

	if ( hasChildren ) {

		const node = document.createElement( 'details' );

		// Default to expanded unless the user has collapsed this node before
		node.open = openState.get( obj.uuid ) ?? true;
		node.addEventListener( 'toggle', () => openState.set( obj.uuid, node.open ) );

		node.appendChild( item );

		for ( const child of children ) {

			renderObject( child, node, level + 1, invisible );

		}

		container.appendChild( node );

	} else {

		container.appendChild( item );

	}

}

// Build the static DOM shell (called once)
function initUI() {

	const header = document.createElement( 'div' );
	header.className = 'header';
	header.innerHTML = `<a href="https://docs.google.com/forms/d/e/1FAIpQLSdw1QcgXNiECYiPx6k0vSQRiRe0FmByrrojV4fgeL5zzXIiCw/viewform?usp=preview" target="_blank">+</a>
		<span class="version">${chrome.runtime.getManifest().version}</span>`;
	document.body.appendChild( header );

	const sections = document.createElement( 'div' );
	sections.className = 'sections-container';
	document.body.appendChild( sections );

	renderersSection = document.createElement( 'div' );
	renderersSection.className = 'section';
	sections.appendChild( renderersSection );

	scenesSection = document.createElement( 'div' );
	scenesSection.className = 'section';
	sections.appendChild( scenesSection );

	floatingPanel = document.createElement( 'div' );
	floatingPanel.className = 'floating-details';
	document.body.appendChild( floatingPanel );

}

// Rebuild a section from a map of items (an empty section is hidden by CSS)
function renderSection( section, title, items, render ) {

	section.innerHTML = items.size > 0 ? `<h3>${title}</h3>` : '';

	items.forEach( item => render( item, section ) );

}

function updateRenderers() {

	renderSection( renderersSection, 'Renderers', state.renderers, renderRenderer );

}

function updateSceneTree() {

	renderSection( scenesSection, 'Scenes', state.scenes, renderObject );

}

// --- Floating details panel ---

function showFloatingDetails( details ) {

	floatingPanel.innerHTML = '';
	floatingPanel.appendChild( createVectorRow( 'Position', details.position ) );
	floatingPanel.appendChild( createVectorRow( 'Rotation', details.rotation ) );
	floatingPanel.appendChild( createVectorRow( 'Scale', details.scale ) );

	floatingPanel.classList.add( 'visible' );
	updateFloatingPanelPosition();

}

function updateFloatingPanelPosition() {

	if ( ! floatingPanel.classList.contains( 'visible' ) ) return;

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

	if ( ! event.target.closest( '.tree-item' ) ) {

		floatingPanel.classList.remove( 'visible' );

	}

} );

initUI();
