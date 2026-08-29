/* global MESSAGE_ID, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, EVENT_REGISTER, EVENT_OBSERVE, EVENT_RENDERER, EVENT_SCENE, EVENT_SCENE_REMOVED, EVENT_OBJECT_DETAILS */

/**
 * Injected into the page by the three.js DevTools extension. Exposes
 * window.__THREE_DEVTOOLS__ for three.js to report renderers and scenes,
 * and answers the panel's requests.
 */

( function () {

	if ( window.__THREE_DEVTOOLS__ ) return;

	const CANVAS_FLASH_DURATION = 1000;
	const SCENE_EMPTY_TICKS_THRESHOLD = 5; // Polls before an empty scene is hidden from the panel, ~5s

	const observedScenes = [];
	const observedRenderers = [];
	const sceneObjectCountCache = new Map(); // Object count per scene at the last batch sent, absent while hidden from the panel
	const sceneEmptyTicks = new Map(); // Consecutive sendState ticks each scene has been empty
	const sceneViews = new Map(); // Where each scene is shown: the renderer, camera and viewport of the pass that put it on screen

	// three.js reports its renderers and scenes by dispatching events on this
	const devTools = new EventTarget();
	Object.defineProperty( window, '__THREE_DEVTOOLS__', { value: devTools, enumerable: true } );

	// Shared with highlight.js and preview.js, which add their own functions here
	devTools.utils = { findObjectInScenes, unobserved, getSceneView };

	// Create an object without reporting it to the panel, for the renderer and scene of preview.js
	let observing = true;

	function unobserved( create ) {

		observing = false;

		try {

			return create();

		} finally {

			observing = true;

		}

	}

	// Send a message to the panel (relayed by the content script)
	function postToPanel( name, detail ) {

		window.postMessage( { id: MESSAGE_ID, name: name, detail: detail }, '/' );

	}

	// --- Scene views ---

	// The renderer copies its viewport into a Vector4 and returns that, so a stand-in returning the numbers will do
	const readViewport = { copy: ( v ) => [ v.x, v.y, v.z, v.w ] };

	// A scene is drawn many times a frame: shadow maps, reflections, post processing. Passes are seen
	// as they finish, so one rendered from inside another is followed by the pass it served, and only
	// a pass to the canvas, or to a texture shaped like it, can be what the page shows.
	function watchScene( scene ) {

		const pageHook = scene.onAfterRender;

		function hook( renderer, scene, camera ) {

			const target = renderer.getRenderTarget();
			const canvas = renderer.domElement;
			const onCanvas = target === null;

			if ( onCanvas || Math.abs( target.width / target.height - canvas.width / canvas.height ) < 0.01 ) {

				sceneViews.set( scene, { scene: scene, renderer: renderer, camera: camera, viewport: onCanvas ? renderer.getViewport( readViewport ) : null } );

			}

			pageHook.apply( this, arguments );

		}

		hook.isDevToolsHook = true;
		scene.onAfterRender = hook;

	}

	function getSceneView( object ) {

		while ( object.parent !== null ) object = object.parent;

		return sceneViews.get( object ) || null;

	}

	// --- Data extraction ---

	function getRendererProperties( renderer ) {

		// WebGL reports its context attributes, WebGPU exposes them directly
		const parameters = renderer.getContextAttributes?.() || { alpha: renderer.alpha, antialias: renderer.samples > 0 };

		return {
			width: renderer.domElement.clientWidth,
			height: renderer.domElement.clientHeight,
			alpha: parameters.alpha || false,
			antialias: parameters.antialias || false,
			outputColorSpace: renderer.outputColorSpace,
			toneMapping: renderer.toneMapping,
			toneMappingExposure: renderer.toneMappingExposure,
			shadows: renderer.shadowMap.enabled,
			autoClear: renderer.autoClear,
			autoClearColor: renderer.autoClearColor,
			autoClearDepth: renderer.autoClearDepth,
			autoClearStencil: renderer.autoClearStencil,
			localClipping: renderer.localClippingEnabled,
			info: {
				render: {
					frame: renderer.isWebGPURenderer ? renderer.info.frame : renderer.info.render.frame,
					calls: renderer.isWebGPURenderer ? renderer.info.render.drawCalls : renderer.info.render.calls,
					triangles: renderer.info.render.triangles,
					points: renderer.info.render.points,
					lines: renderer.info.render.lines
				},
				memory: {
					geometries: renderer.info.memory.geometries,
					textures: renderer.info.memory.textures,
					// WebGPU counts its programs instead of listing them
					programs: renderer.info.programs ? renderer.info.programs.length : renderer.info.memory.programs
				}
			}
		};

	}

	function getObjectData( object ) {

		const data = {
			uuid: object.uuid,
			name: object.name,
			type: object.isInstancedMesh ? 'InstancedMesh' : object.type, // InstancedMesh doesn't set its own type
			visible: object.visible,
			isScene: object.isScene === true,
			isCamera: object.isCamera === true,
			isLight: object.isLight === true,
			isGroup: object.isGroup === true,
			isMesh: object.isMesh === true,
			isInstancedMesh: object.isInstancedMesh === true,
			children: object.children.map( child => child.uuid )
		};

		if ( object.isMesh ) {

			data.geometryType = object.geometry.type;
			data.materialType = [].concat( object.material ).map( material => material.type ).join( ', ' );

		}

		if ( object.isInstancedMesh ) {

			data.count = object.count;

		}

		return data;

	}

	function getGeometryData( geometry ) {

		const properties = {};

		for ( const [ name, attribute ] of Object.entries( geometry.attributes ) ) {

			properties[ name ] = `${attribute.count} × ${attribute.itemSize}`;

		}

		if ( geometry.index !== null ) properties.index = geometry.index.count;
		if ( geometry.groups.length > 0 ) properties.groups = geometry.groups.length;

		return { type: geometry.type, name: geometry.name, properties: properties };

	}

	// Identity, shader sources and the blend/stencil/clip/polygon offset plumbing would drown the interesting properties
	const HIDDEN_MATERIAL_PROPERTIES = /^(is|blend[A-Z]|stencil|clip|polygonOffset)|^(uuid|name|type|version|userData|defines|vertexShader|fragmentShader|depthFunc|shadowSide|colorWrite|precision|dithering|premultipliedAlpha|forceSinglePass|allowOverride)$/;

	function getMaterialData( material ) {

		const properties = {};

		for ( const [ key, value ] of Object.entries( material ) ) {

			// alphaTest, clearcoat, transmission and friends are stored in an underscored field behind a getter
			const name = key.startsWith( '_' ) && key.slice( 1 ) in material ? key.slice( 1 ) : key;

			if ( HIDDEN_MATERIAL_PROPERTIES.test( name ) ) continue;

			const formatted = formatMaterialValue( value );
			if ( formatted !== undefined ) properties[ name ] = formatted;

		}

		return { type: material.type, name: material.name, properties: properties };

	}

	// Plain values pass through, colors, textures, nodes and math objects are summarized, everything else is skipped
	function formatMaterialValue( value ) {

		if ( value === null || typeof value === 'function' ) return undefined;
		if ( typeof value !== 'object' ) return value;
		if ( value.isColor ) return '#' + value.getHexString();
		if ( value.isTexture ) return value.name || ( value.image && value.image.width ? `${value.image.width} × ${value.image.height}` : 'Texture' );
		if ( value.isNode ) return value.type;

		// Vectors, Eulers and matrices. A TSL node answers to any property, so the result has to be checked
		if ( typeof value.toArray === 'function' ) {

			const array = value.toArray();
			if ( Array.isArray( array ) ) return array;

		}

	}

	// Collect data for an object and all of its descendants
	function collectSceneObjects( object, objects = [] ) {

		objects.push( getObjectData( object ) );

		for ( const child of object.children ) collectSceneObjects( child, objects );

		return objects;

	}

	function findObjectInScenes( uuid ) {

		for ( const scene of observedScenes ) {

			const object = scene.getObjectByProperty( 'uuid', uuid );
			if ( object !== undefined ) return object;

		}

		return null;

	}

	// --- Three.js events ---

	devTools.addEventListener( EVENT_REGISTER, ( event ) => postToPanel( EVENT_REGISTER, event.detail ) );

	devTools.addEventListener( EVENT_OBSERVE, ( event ) => {

		if ( observing === false ) return;

		const object = event.detail;

		if ( object.isWebGLRenderer || object.isWebGPURenderer ) {

			// Renderers have no uuid of their own
			object.uuid = [ ...crypto.getRandomValues( new Uint8Array( 16 ) ) ].map( b => b.toString( 16 ).padStart( 2, '0' ) ).join( '' );

			observedRenderers.push( object );
			sendRenderer( object );

		} else if ( object.isScene ) {

			observedScenes.push( object );
			watchScene( object );
			sendSceneObjects( object );

		}

	} );

	// Old three.js versions don't register themselves, detect the global instead
	window.addEventListener( 'load', () => {

		if ( window.THREE && window.THREE.REVISION ) postToPanel( EVENT_REGISTER, { revision: window.THREE.REVISION } );

	} );

	// --- Panel requests ---

	window.addEventListener( 'message', ( event ) => {

		// Only accept messages from the same frame
		if ( event.source !== window ) return;

		const message = event.data;
		if ( ! message || message.id !== MESSAGE_ID ) return;

		switch ( message.name ) {

			case MESSAGE_REQUEST_STATE:
				sendState();
				break;

			case MESSAGE_REQUEST_OBJECT_DETAILS:
				sendObjectDetails( message.uuid, message.preview );
				break;

			case MESSAGE_SCROLL_TO_CANVAS:
				scrollToCanvas( message.uuid );
				break;

			case MESSAGE_HIGHLIGHT_OBJECT:
				devTools.utils.highlight( message.uuid );
				break;

			case MESSAGE_UNHIGHLIGHT_OBJECT:
				devTools.utils.unhighlight();
				break;

		}

	} );

	function sendState() {

		for ( const renderer of observedRenderers ) sendRenderer( renderer );

		// Scenes have no dispose(), so one that stays empty for several polls is
		// hidden from the panel, and brought back if it gains children again
		for ( const scene of observedScenes ) {

			// The page may have replaced the hook since the scene was observed
			if ( scene.onAfterRender.isDevToolsHook !== true ) watchScene( scene );

			const ticks = scene.children.length === 0 ? ( sceneEmptyTicks.get( scene.uuid ) || 0 ) + 1 : 0;

			sceneEmptyTicks.set( scene.uuid, ticks );

			if ( ticks < SCENE_EMPTY_TICKS_THRESHOLD ) {

				sendSceneObjects( scene );

			} else if ( ticks === SCENE_EMPTY_TICKS_THRESHOLD ) {

				// Dropping the count as well brings the scene back with a full batch
				sceneObjectCountCache.delete( scene.uuid );
				postToPanel( EVENT_SCENE_REMOVED, { uuid: scene.uuid } );

			}

		}

	}

	function sendRenderer( renderer ) {

		try {

			postToPanel( EVENT_RENDERER, {
				uuid: renderer.uuid,
				type: renderer.isWebGLRenderer ? 'WebGLRenderer' : 'WebGPURenderer',
				properties: getRendererProperties( renderer ),
				canvasInDOM: document.contains( renderer.domElement )
			} );

		} catch ( error ) {

			console.warn( 'DevTools: Error getting renderer data:', error );

		}

	}

	// Send a scene batch when its object count changed (a hidden scene has no count, so it comes back)
	function sendSceneObjects( scene ) {

		const objects = collectSceneObjects( scene );

		if ( objects.length !== sceneObjectCountCache.get( scene.uuid ) ) {

			sceneObjectCountCache.set( scene.uuid, objects.length );
			postToPanel( EVENT_SCENE, { sceneUuid: scene.uuid, objects: objects } );

		}

	}

	function sendObjectDetails( uuid, preview ) {

		const object = findObjectInScenes( uuid );
		if ( object === null ) return;

		postToPanel( EVENT_OBJECT_DETAILS, {
			uuid: uuid,
			position: object.position.toArray(),
			rotation: object.rotation.toArray(),
			scale: object.scale.toArray(),
			geometry: object.geometry ? getGeometryData( object.geometry ) : null,
			materials: object.material ? [].concat( object.material ).map( getMaterialData ) : [],
			preview: preview ? devTools.utils.renderPreview( object ) : null
		} );

	}

	function scrollToCanvas( uuid ) {

		// Without a uuid, pick the first renderer whose canvas is in the DOM
		const renderer = uuid ?
			observedRenderers.find( candidate => candidate.uuid === uuid ) :
			observedRenderers.find( candidate => document.contains( candidate.domElement ) );

		if ( renderer === undefined ) return;

		renderer.domElement.scrollIntoView( { behavior: 'smooth', block: 'center', inline: 'center' } );
		flashCanvas( renderer.domElement );

	}

	// Brief blue overlay on top of the canvas
	function flashCanvas( canvas ) {

		const bounds = canvas.getBoundingClientRect();

		const overlay = document.createElement( 'div' );
		overlay.style.cssText = `position: absolute; top: ${bounds.top + window.scrollY}px; left: ${bounds.left + window.scrollX}px; width: ${bounds.width}px; height: ${bounds.height}px; background: rgba(0, 122, 204, 0.3); pointer-events: none; z-index: 999999;`;

		// On <html>, so a positioned <body> cannot offset the document coordinates above
		document.documentElement.appendChild( overlay );

		setTimeout( () => overlay.remove(), CANVAS_FLASH_DURATION );

	}

} )();
