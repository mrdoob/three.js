/* global chrome, MESSAGE_INIT, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, EVENT_RENDERER, EVENT_OBJECT_DETAILS, EVENT_SCENE, EVENT_SCENE_REMOVED, EVENT_COMMITTED */

const STATE_POLLING_INTERVAL = 1000;

// --- State ---

const state = {
	scenes: new Map(),
	renderers: new Map(),
	objects: new Map()
};

// Open/closed state of collapsible nodes (uuid -> boolean), kept across rebuilds
const openState = new Map();

// Objects expanded in the tree (uuid -> its details block, kept across rebuilds so the selection and the image survive)
const expanded = new Map();

// Static DOM from panel.html
const renderersSection = document.getElementById( 'renderers' );
const scenesSection = document.getElementById( 'scenes' );

document.querySelector( '.version' ).textContent = chrome.runtime.getManifest().version;

// --- Connection ---

const port = chrome.runtime.connect();
const intervalId = setInterval( poll, STATE_POLLING_INTERVAL );

function send( name, data ) {

	try {

		port.postMessage( { name: name, ...data } );

	} catch ( error ) {

		// Extension reloaded under an open panel, chrome.runtime is gone
		clearInterval( intervalId );

	}

}

function poll() {

	send( MESSAGE_REQUEST_STATE );

	// A preview costs the page a frame, so it is only asked for on expand and when the geometry or material changes
	for ( const uuid of expanded.keys() ) send( MESSAGE_REQUEST_OBJECT_DETAILS, { uuid: uuid, preview: false } );

}

send( MESSAGE_INIT, { tabId: chrome.devtools.inspectedWindow.tabId } );
send( MESSAGE_REQUEST_STATE );

port.onDisconnect.addListener( () => {

	clearInterval( intervalId );
	clearState();

} );

port.onMessage.addListener( ( message ) => {

	const detail = message.detail;

	switch ( message.name ) {

		case EVENT_RENDERER:
			detail._frameId = message.frameId;
			state.renderers.set( detail.uuid, detail );
			updateRenderers();
			break;

		case EVENT_OBJECT_DETAILS:
			if ( expanded.has( detail.uuid ) ) renderObjectDetails( expanded.get( detail.uuid ), detail );
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

// Drop a scene's objects, except the ones a new batch still lists
function forgetObjects( sceneUuid, keep = new Set() ) {

	state.objects.forEach( ( object, uuid ) => {

		if ( object._sceneUuid === sceneUuid && ! keep.has( uuid ) ) {

			state.objects.delete( uuid );
			openState.delete( uuid );

		}

	} );

}

// Replace the objects of a scene with a new batch from the bridge
function processSceneBatch( sceneUuid, objects, frameId ) {

	forgetObjects( sceneUuid, new Set( objects.map( object => object.uuid ) ) );

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
	forgetObjects( sceneUuid );

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
	expanded.clear();

}

// --- Rendering ---

function getObjectIcon( object ) {

	if ( object.isScene ) return '🌍';
	if ( object.isCamera ) return '📷';
	if ( object.isLight ) return '💡';
	if ( object.isInstancedMesh ) return '🔸';
	if ( object.isMesh ) return '🔷';
	if ( object.isGroup ) return '📁';
	return '📦';

}

// Sort order of children in the tree
function getObjectOrder( object ) {

	if ( object.isCamera ) return 1;
	if ( object.isLight ) return 2;
	if ( object.isGroup ) return 3;
	if ( object.isMesh ) return 4;
	return 5;

}

// A dimmer detail after a row's name or a heading's type. Text comes from the page, so it is set as text.
function appendDetail( element, text ) {

	const detail = document.createElement( 'span' );
	detail.className = 'object-details';
	detail.textContent = text;

	element.append( ' ', detail );

}

function createLabel( name, details ) {

	const label = document.createElement( 'span' );
	label.className = 'label';
	label.textContent = name;

	if ( details.length > 0 ) appendDetail( label, details.join( ' ・ ' ) );

	return label;

}

function formatValue( value ) {

	if ( value === undefined || value === null ) return '–';
	if ( Array.isArray( value ) ) return value.map( formatValue ).join( ', ' );
	if ( typeof value === 'number' ) return value.toLocaleString();
	return value;

}

function createPropertyRow( label, value ) {

	const row = document.createElement( 'div' );
	row.className = 'property-row';

	const labelSpan = document.createElement( 'span' );
	labelSpan.textContent = label;

	const valueSpan = document.createElement( 'span' );
	valueSpan.className = 'property-value';
	valueSpan.textContent = formatValue( value );

	row.append( labelSpan, valueSpan );

	return row;

}

// A column of titled property groups ([ title, rows ] pairs)
function createPropertyColumn( ...groups ) {

	const column = document.createElement( 'div' );
	column.className = 'property-column';

	for ( const [ title, rows ] of groups ) {

		const group = document.createElement( 'div' );
		group.className = 'property-group';

		const heading = document.createElement( 'h4' );
		heading.textContent = title;
		group.appendChild( heading );

		for ( const [ label, value ] of rows ) group.appendChild( createPropertyRow( label, value ) );

		column.appendChild( group );

	}

	return column;

}

// A dropdown of an item's properties, the selected one shown beside it
function createPropertyPicker( rows ) {

	const select = document.createElement( 'select' );
	for ( const [ label ] of rows ) select.appendChild( new Option( label ) );

	const value = document.createElement( 'span' );
	value.className = 'property-value';
	select.addEventListener( 'change', () => value.textContent = select.value );

	const picker = document.createElement( 'div' );
	picker.className = 'property-row picker';
	picker.append( select, value );

	return picker;

}

// The options carry the current values, so the selected one is simply select.value
function updatePropertyPicker( picker, rows ) {

	const select = picker.firstChild;

	rows.forEach( ( [ , value ], i ) => select.options[ i ].value = formatValue( value ) );
	picker.lastChild.textContent = select.value;

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

	const toggle = document.createElement( 'span' );
	toggle.className = 'tree-toggle';

	const summary = document.createElement( 'summary' );
	summary.className = 'tree-item';
	summary.append( toggle, label );

	if ( renderer.canvasInDOM ) {

		const button = document.createElement( 'button' );
		button.className = 'scroll-to-canvas-btn';
		button.title = 'Scroll to canvas';
		button.textContent = '🙂';
		button.addEventListener( 'click', () => send( MESSAGE_SCROLL_TO_CANVAS, { uuid: renderer.uuid } ) );

		summary.appendChild( button );

	} else {

		const placeholder = document.createElement( 'span' );
		placeholder.className = 'scroll-to-canvas-placeholder';
		placeholder.title = 'Canvas not in DOM';
		placeholder.textContent = '🫥';

		summary.appendChild( placeholder );

	}

	node.appendChild( summary );

	const properties = document.createElement( 'div' );
	properties.className = 'properties-list';
	properties.appendChild( createPropertyColumn( [ 'Properties', [
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
	]] ) );
	properties.appendChild( createPropertyColumn( [ 'Render Stats', [
		[ 'Frame', info.render.frame ],
		[ 'Draw Calls', info.render.calls ],
		[ 'Triangles', info.render.triangles ],
		[ 'Points', info.render.points ],
		[ 'Lines', info.render.lines ]
	]], [ 'Memory', [
		[ 'Geometries', info.memory.geometries ],
		[ 'Textures', info.memory.textures ],
		[ 'Shader Programs', info.memory.programs ]
	]] ) );
	node.appendChild( properties );

	container.appendChild( node );

}

// Render an object and its children
function renderObject( object, container, level = 0, parentInvisible = false ) {

	// A batch can arrive while the tree is rendering, so a listed child is not always in state yet
	const children = object.children
		.map( uuid => state.objects.get( uuid ) )
		.filter( child => child !== undefined )
		.sort( ( a, b ) => getObjectOrder( a ) - getObjectOrder( b ) );

	const hasChildren = children.length > 0;
	const invisible = parentInvisible || object.visible === false;

	let name = object.name || object.type;
	const details = [];

	if ( object.isInstancedMesh ) name += ` [${object.count}]`;
	if ( object.isMesh ) details.push( `${object.geometryType} ${object.materialType}` );

	if ( object.isScene ) {

		const objects = [ ...state.objects.values() ].filter( item => item._sceneUuid === object.uuid && ! item.isScene );
		const lights = objects.filter( item => item.isLight );

		details.push( `${objects.length} objects` );
		if ( lights.length > 0 ) details.push( `${lights.length} lights` );

	}

	const toggle = document.createElement( 'span' );
	toggle.className = hasChildren ? 'tree-toggle' : 'tree-toggle-placeholder';

	const icon = document.createElement( 'span' );
	icon.className = 'icon';
	icon.textContent = getObjectIcon( object );

	const type = document.createElement( 'span' );
	type.className = 'type';
	type.textContent = object.type;

	const item = document.createElement( hasChildren ? 'summary' : 'div' );
	item.className = 'tree-item';
	item.style.paddingLeft = `${level * 20}px`;
	if ( invisible ) item.classList.add( 'invisible' );
	if ( expanded.has( object.uuid ) ) item.classList.add( 'expanded' );
	item.append( toggle, icon, createLabel( name, details ), type );

	// The arrow toggles the children, the rest of the row toggles the details
	item.addEventListener( 'click', ( event ) => {

		if ( event.target.classList.contains( 'tree-toggle' ) ) return;

		event.preventDefault();
		toggleDetails( object.uuid );

	} );

	item.addEventListener( 'mouseenter', () => send( MESSAGE_HIGHLIGHT_OBJECT, { uuid: object.uuid } ) );
	item.addEventListener( 'mouseleave', () => send( MESSAGE_UNHIGHLIGHT_OBJECT ) );

	// Objects with children are a collapsible node, the row being its summary
	let parent = container;

	if ( hasChildren ) {

		parent = document.createElement( 'details' );

		// Default to open unless the user has collapsed this node before
		parent.open = openState.get( object.uuid ) ?? true;
		parent.addEventListener( 'toggle', () => openState.set( object.uuid, parent.open ) );

		container.appendChild( parent );

	}

	parent.appendChild( item );

	if ( expanded.has( object.uuid ) ) {

		const block = expanded.get( object.uuid );
		block.style.marginLeft = `${level * 20}px`;
		parent.appendChild( block );

	}

	for ( const child of children ) {

		renderObject( child, parent, level + 1, invisible );

	}

}

// Expand or collapse an object's details under its row
function toggleDetails( uuid ) {

	if ( expanded.has( uuid ) ) {

		expanded.delete( uuid );

	} else {

		const image = document.createElement( 'img' );
		image.className = 'preview';

		const block = document.createElement( 'div' );
		block.className = 'properties-list';
		block.appendChild( image );

		expanded.set( uuid, block );
		send( MESSAGE_REQUEST_OBJECT_DETAILS, { uuid: uuid, preview: true } );

	}

	updateSceneTree();

}

// The object rendered with its own material in one column, its transform, geometry and materials in the other.
// Built once, then only refreshed, so the selections stay and the image does not flicker.
function renderObjectDetails( block, details ) {

	const groups = details.materials.map( material => [ material, Object.entries( material.properties ) ] );
	if ( details.geometry !== null ) groups.unshift( [ details.geometry, Object.entries( details.geometry.properties ) ] );

	// A swapped geometry or material changes a type, a name or the number of properties
	const signature = groups.map( ( [ item, rows ] ) => item.type + item.name + rows.length ).join();

	const image = block.firstChild;

	// The first details fill an empty block, any later change is a swapped geometry or material
	const swapped = block.dataset.signature !== undefined && block.dataset.signature !== signature;

	if ( block.dataset.signature !== signature ) {

		block.dataset.signature = signature;

		// The render that arrived with these details is of what the object used to be
		if ( swapped ) send( MESSAGE_REQUEST_OBJECT_DETAILS, { uuid: details.uuid, preview: true } );

		const transform = document.createElement( 'div' );
		transform.className = 'transform';

		const column = document.createElement( 'div' );
		column.className = 'property-group object-properties';
		column.appendChild( transform );

		for ( const [ item, rows ] of groups ) {

			// The type in bold, then the name the page gave it
			const heading = document.createElement( 'h4' );
			heading.textContent = item.type;
			if ( item.name ) appendDetail( heading, item.name );

			column.append( heading, createPropertyPicker( rows ) );

		}

		block.replaceChildren( image, column );

	}

	const pickers = block.querySelectorAll( '.picker' );
	groups.forEach( ( [ , rows ], i ) => updatePropertyPicker( pickers[ i ], rows ) );

	// A preview comes with the details when one was asked for, an object that has none keeps no tile
	if ( 'preview' in details ) {

		image.hidden = details.preview === null;
		if ( details.preview !== null ) image.src = details.preview;

	}

	block.querySelector( '.transform' ).replaceChildren(
		createPropertyRow( 'Position', details.position ),
		createPropertyRow( 'Rotation', details.rotation ),
		createPropertyRow( 'Scale', details.scale )
	);

}

// Rebuild a section from a map of items (an empty section is hidden by CSS)
function renderSection( section, title, items, render ) {

	section.innerHTML = items.size > 0 ? `<h3>${title}</h3>` : '';

	items.forEach( item => render( item, section ) );

}

function updateRenderers() {

	renderSection( renderersSection, 'Renderers', state.renderers, renderRenderer );

}

// Rebuild the scene tree, forgetting expanded objects that are gone
function updateSceneTree() {

	for ( const uuid of expanded.keys() ) {

		if ( ! state.objects.has( uuid ) ) expanded.delete( uuid );

	}

	renderSection( scenesSection, 'Scenes', state.scenes, renderObject );

}
