/* global MESSAGE_ID, HIGHLIGHT_NAME, MESSAGE_REQUEST_STATE, MESSAGE_REQUEST_OBJECT_DETAILS, MESSAGE_SCROLL_TO_CANVAS, MESSAGE_HIGHLIGHT_OBJECT, MESSAGE_UNHIGHLIGHT_OBJECT, EVENT_REGISTER, EVENT_OBSERVE, EVENT_RENDERER, EVENT_SCENE, EVENT_SCENE_REMOVED, EVENT_OBJECT_DETAILS */

/**
 * Injected into the page by the three.js DevTools extension. Exposes
 * window.__THREE_DEVTOOLS__ for three.js to report renderers and scenes,
 * and answers the panel's requests.
 */

( function () {

	if ( window.__THREE_DEVTOOLS__ ) return;

	const CANVAS_FLASH_DURATION = 1000;
	const SCENE_EMPTY_TICKS_THRESHOLD = 5; // ~5s at 1s polling - hide empty scene from the panel

	const observedScenes = [];
	const observedRenderers = [];
	const sceneObjectCountCache = new Map(); // Object count per scene at the last batch sent, absent while hidden from the panel
	const sceneEmptyTicks = new Map(); // Consecutive sendState ticks each scene has been empty

	// three.js reports its renderers and scenes by dispatching events on this
	const devTools = new EventTarget();
	Object.defineProperty( window, '__THREE_DEVTOOLS__', { value: devTools, enumerable: true } );

	// Expose utilities for highlight.js
	devTools.utils = { findObjectInScenes };

	// Renderers have no uuid of their own
	function generateUUID() {

		const array = new Uint8Array( 16 );
		crypto.getRandomValues( array );
		array[ 6 ] = ( array[ 6 ] & 0x0f ) | 0x40; // Set version to 4
		array[ 8 ] = ( array[ 8 ] & 0x3f ) | 0x80; // Set variant to 10
		return [ ...array ].map( ( b, i ) => ( i === 4 || i === 6 || i === 8 || i === 10 ? '-' : '' ) + b.toString( 16 ).padStart( 2, '0' ) ).join( '' );

	}

	function xyz( vector ) {

		return { x: vector.x, y: vector.y, z: vector.z };

	}

	// Send a message to the panel (relayed by the content script)
	function postToPanel( name, detail ) {

		window.postMessage( { id: MESSAGE_ID, name: name, detail: detail }, '*' );

	}

	// --- Data extraction ---

	function getRendererProperties( renderer ) {

		const parameters = renderer.getContextAttributes ? renderer.getContextAttributes() : {};

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
					programs: renderer.info.programs ? renderer.info.programs.length : 0
				}
			}
		};

	}

	function getRendererData( renderer ) {

		try {

			return {
				uuid: renderer.uuid,
				type: renderer.isWebGLRenderer ? 'WebGLRenderer' : 'WebGPURenderer',
				properties: getRendererProperties( renderer ),
				canvasInDOM: document.contains( renderer.domElement )
			};

		} catch ( error ) {

			console.warn( 'DevTools: Error getting renderer data:', error );
			return null;

		}

	}

	function getObjectData( object ) {

		try {

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
				data.materialType = Array.isArray( object.material ) ? object.material.map( m => m.type ).join( ', ' ) : object.material.type;

			}

			if ( object.isInstancedMesh ) {

				data.count = object.count;

			}

			return data;

		} catch ( error ) {

			console.warn( 'DevTools: Error getting object data:', error );
			return null;

		}

	}

	// Collect data for a scene and all of its descendants
	function collectSceneObjects( scene ) {

		const objects = [];

		( function traverse( object ) {

			// Skip the highlight clone added by highlight.js
			if ( object.name === HIGHLIGHT_NAME ) return;

			const data = getObjectData( object );
			if ( data !== null ) objects.push( data );

			object.children.forEach( traverse );

		} )( scene );

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

	devTools.addEventListener( EVENT_REGISTER, ( event ) => {

		postToPanel( EVENT_REGISTER, event.detail );

	} );

	devTools.addEventListener( EVENT_OBSERVE, ( event ) => {

		const object = event.detail;

		if ( object.isWebGLRenderer || object.isWebGPURenderer ) {

			if ( object.uuid === undefined ) object.uuid = generateUUID();

			const data = getRendererData( object );

			if ( data !== null ) {

				observedRenderers.push( object );
				postToPanel( EVENT_RENDERER, data );

			}

		} else if ( object.isScene ) {

			observedScenes.push( object );
			reloadSceneObjects( object );

		}

	} );

	// Old three.js versions don't register themselves, detect the global instead
	window.addEventListener( 'load', () => {

		if ( window.THREE && window.THREE.REVISION ) {

			postToPanel( EVENT_REGISTER, { revision: window.THREE.REVISION } );

		}

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
				sendObjectDetails( message.uuid );
				break;

			case MESSAGE_SCROLL_TO_CANVAS:
				scrollToCanvas( message.uuid );
				break;

			case MESSAGE_HIGHLIGHT_OBJECT:
				devTools.dispatchEvent( new CustomEvent( MESSAGE_HIGHLIGHT_OBJECT, { detail: { uuid: message.uuid } } ) );
				break;

			case MESSAGE_UNHIGHLIGHT_OBJECT:
				devTools.dispatchEvent( new CustomEvent( MESSAGE_UNHIGHLIGHT_OBJECT ) );
				break;

		}

	} );

	function sendState() {

		for ( const renderer of observedRenderers ) {

			const data = getRendererData( renderer );
			if ( data !== null ) postToPanel( EVENT_RENDERER, data );

		}

		// Scenes have no dispose(), so one that stays empty for several polls is
		// hidden from the panel, and brought back if it gains children again
		for ( const scene of observedScenes ) {

			if ( scene.children.length === 0 ) {

				// Already hidden, nothing to send until children come back
				if ( ! sceneObjectCountCache.has( scene.uuid ) ) continue;

				const ticks = ( sceneEmptyTicks.get( scene.uuid ) || 0 ) + 1;

				if ( ticks >= SCENE_EMPTY_TICKS_THRESHOLD ) {

					sceneEmptyTicks.delete( scene.uuid );
					sceneObjectCountCache.delete( scene.uuid );
					postToPanel( EVENT_SCENE_REMOVED, { uuid: scene.uuid } );
					continue;

				}

				sceneEmptyTicks.set( scene.uuid, ticks );

			} else {

				sceneEmptyTicks.delete( scene.uuid );

			}

			reloadSceneObjects( scene );

		}

	}

	// Send a scene batch when its object count changed (a hidden scene has no count, so it comes back)
	function reloadSceneObjects( scene ) {

		const objects = collectSceneObjects( scene );

		if ( objects.length !== sceneObjectCountCache.get( scene.uuid ) ) {

			sceneObjectCountCache.set( scene.uuid, objects.length );
			postToPanel( EVENT_SCENE, { sceneUuid: scene.uuid, objects: objects } );

		}

	}

	function sendObjectDetails( uuid ) {

		const object = findObjectInScenes( uuid );

		if ( object ) {

			postToPanel( EVENT_OBJECT_DETAILS, {
				position: xyz( object.position ),
				rotation: xyz( object.rotation ),
				scale: xyz( object.scale )
			} );

		}

	}

	function scrollToCanvas( uuid ) {

		// Without a uuid, pick the first renderer whose canvas is in the DOM
		const renderer = uuid ?
			observedRenderers.find( r => r.uuid === uuid ) :
			observedRenderers.find( r => document.contains( r.domElement ) );

		if ( renderer ) {

			renderer.domElement.scrollIntoView( { behavior: 'smooth', block: 'center', inline: 'center' } );

			flashCanvas( renderer.domElement );

		}

	}

	// Brief blue overlay on top of the canvas
	function flashCanvas( canvas ) {

		const overlay = document.createElement( 'div' );
		overlay.style.cssText = `
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background-color: rgba(0, 122, 204, 0.3);
			pointer-events: none;
			z-index: 999999;
		`;

		// Position the overlay relative to the canvas
		const parent = canvas.parentElement || document.body;

		if ( getComputedStyle( parent ).position === 'static' ) {

			parent.style.position = 'relative';

		}

		parent.appendChild( overlay );

		setTimeout( () => overlay.remove(), CANVAS_FLASH_DURATION );

	}

} )();
