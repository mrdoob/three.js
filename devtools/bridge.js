/**
 * This script injected by the installed three.js developer
 * tools extension.
 */

( function () {

	// Constants
	const MESSAGE_ID = 'three-devtools';
	const EVENT_REGISTER = 'register';
	const EVENT_OBSERVE = 'observe';
	const EVENT_RENDERER = 'renderer';
	const EVENT_SCENE = 'scene';
	const EVENT_OBJECT_DETAILS = 'object-details';
	const EVENT_DEVTOOLS_READY = 'devtools-ready';
	const MESSAGE_REQUEST_STATE = 'request-state';
	const MESSAGE_REQUEST_OBJECT_DETAILS = 'request-object-details';
	const MESSAGE_SCROLL_TO_CANVAS = 'scroll-to-canvas';
	const HIGHLIGHT_OVERLAY_DURATION = 1000;

	// Only initialize if not already initialized
	if ( ! window.__THREE_DEVTOOLS__ ) {

		// Create our custom EventTarget with logging
		class DevToolsEventTarget extends EventTarget {

			constructor() {

				super();
				this._ready = false;
				this._backlog = [];
				this.objects = new Map();

			}

			addEventListener( type, listener, options ) {

				super.addEventListener( type, listener, options );

				// If this is the first listener for a type, and we have backlogged events,
				// check if we should process them
				if ( type !== EVENT_DEVTOOLS_READY && this._backlog.length > 0 ) {

					this.dispatchEvent( new CustomEvent( EVENT_DEVTOOLS_READY ) );

				}

			}

			dispatchEvent( event ) {

				if ( this._ready || event.type === EVENT_DEVTOOLS_READY ) {

					if ( event.type === EVENT_DEVTOOLS_READY ) {

						this._ready = true;
						const backlog = this._backlog;
						this._backlog = [];
						backlog.forEach( e => super.dispatchEvent( e ) );

					}

					return super.dispatchEvent( event );

				} else {

					this._backlog.push( event );
					return false; // Return false to indicate synchronous handling

				}

			}

			reset() {


				// Clear objects map
				this.objects.clear();

				// Clear backlog
				this._backlog = [];

				// Reset ready state
				this._ready = false;

				// Clear observed arrays
				observedScenes.length = 0;
				observedRenderers.length = 0;

			}

		}

		// Create and expose the __THREE_DEVTOOLS__ object
		const devTools = new DevToolsEventTarget();
		Object.defineProperty( window, '__THREE_DEVTOOLS__', {
			value: devTools,
			configurable: false,
			enumerable: true,
			writable: false
		} );

		// Declare arrays for tracking observed objects
		const observedScenes = [];
		const observedRenderers = [];
		const sceneObjectCountCache = new Map(); // Cache for object counts per scene

		// Shared tree traversal function
		function traverseObjectTree( rootObject, callback, skipDuplicates = false ) {

			const processedUUIDs = skipDuplicates ? new Set() : null;

			function traverse( object ) {

				if ( ! object || ! object.uuid ) return;

				// Skip if already processed (when duplicate prevention is enabled)
				if ( processedUUIDs && processedUUIDs.has( object.uuid ) ) return;
				if ( processedUUIDs ) processedUUIDs.add( object.uuid );

				// Execute callback for this object
				callback( object );

				// Process children recursively
				if ( object.children && Array.isArray( object.children ) ) {

					object.children.forEach( child => traverse( child ) );

				}

			}

			traverse( rootObject );

		}

		// Function to get renderer data
		function getRendererData( renderer ) {

			try {

				const data = {
					uuid: renderer.uuid || generateUUID(),
					type: renderer.isWebGLRenderer ? 'WebGLRenderer' : 'WebGPURenderer',
					name: '',
					properties: getRendererProperties( renderer ),
					canvasInDOM: renderer.domElement && document.contains( renderer.domElement )
				};
				return data;

			} catch ( error ) {

				console.warn( 'DevTools: Error getting renderer data:', error );
				return null;

			}

		}

		// Function to get object hierarchy
		function getObjectData( obj ) {

			try {

				// Special case for WebGLRenderer
				if ( obj.isWebGLRenderer === true || obj.isWebGPURenderer === true ) {

					return getRendererData( obj );

				}

				// Special case for InstancedMesh
				const type = obj.isInstancedMesh ? 'InstancedMesh' : obj.type || obj.constructor.name;

				// Get descriptive name for the object
				let name = obj.name || type || obj.constructor.name;
				if ( obj.isMesh ) {

					const geoType = obj.geometry ? obj.geometry.type : 'Unknown';
					const matType = obj.material ?
						( Array.isArray( obj.material ) ?
							obj.material.map( m => m.type ).join( ', ' ) :
							obj.material.type ) :
						'Unknown';
					if ( obj.isInstancedMesh ) {

						name = `${name} [${obj.count}]`;

					}

					name = `${name} <span class="object-details">${geoType} ${matType}</span>`;

				}

				const data = {
					uuid: obj.uuid,
					name: name,
					type: type,
					visible: obj.visible !== undefined ? obj.visible : true,
					isScene: obj.isScene === true,
					isObject3D: obj.isObject3D === true,
					isCamera: obj.isCamera === true,
					isLight: obj.isLight === true,
					isMesh: obj.isMesh === true,
					isInstancedMesh: obj.isInstancedMesh === true,
					parent: obj.parent ? obj.parent.uuid : null,
					children: obj.children ? obj.children.map( child => child.uuid ) : []
				};

				return data;

			} catch ( error ) {

				console.warn( 'DevTools: Error getting object data:', error );
				return null;

			}

		}

		// Generate a UUID for objects that don't have one
		function generateUUID() {

			const array = new Uint8Array( 16 );
			crypto.getRandomValues( array );
			array[ 6 ] = ( array[ 6 ] & 0x0f ) | 0x40; // Set version to 4
			array[ 8 ] = ( array[ 8 ] & 0x3f ) | 0x80; // Set variant to 10
			return [ ...array ].map( ( b, i ) => ( i === 4 || i === 6 || i === 8 || i === 10 ? '-' : '' ) + b.toString( 16 ).padStart( 2, '0' ) ).join( '' );

		}

		// Listen for Three.js registration
		devTools.addEventListener( EVENT_REGISTER, ( event ) => {

			dispatchEvent( EVENT_REGISTER, event.detail );

		} );

		// Listen for object observations
		devTools.addEventListener( EVENT_OBSERVE, ( event ) => {

			const obj = event.detail;
			if ( ! obj ) {

				console.warn( 'DevTools: Received observe event with null/undefined detail' );
				return;

			}

			// Generate UUID if needed
			if ( ! obj.uuid ) {

				obj.uuid = generateUUID();

			}

			// Skip if already registered (essential to prevent loops with batching)
			if ( devTools.objects.has( obj.uuid ) ) {

				return;

			}

			if ( obj.isWebGLRenderer || obj.isWebGPURenderer ) {

				const data = getObjectData( obj );

				if ( data ) {

					data.properties = getRendererProperties( obj );
					observedRenderers.push( obj );
					devTools.objects.set( obj.uuid, data );

					dispatchEvent( EVENT_RENDERER, data );

				}

			} else if ( obj.isScene ) {

				observedScenes.push( obj );

				const batchObjects = [];

				traverseObjectTree( obj, ( currentObj ) => {

					const objectData = getObjectData( currentObj );
					if ( objectData ) {

						batchObjects.push( objectData );
						devTools.objects.set( currentObj.uuid, objectData ); // Update local cache during batch creation

					}

				}, true );

				dispatchEvent( EVENT_SCENE, { sceneUuid: obj.uuid, objects: batchObjects } );

			}

		} );

		// Function to get renderer properties
		function getRendererProperties( renderer ) {

			const parameters = renderer.getContextAttributes ? renderer.getContextAttributes() : {};

			return {
				width: renderer.domElement ? renderer.domElement.clientWidth : 0,
				height: renderer.domElement ? renderer.domElement.clientHeight : 0,
				alpha: parameters.alpha || false,
				antialias: parameters.antialias || false,
				outputColorSpace: renderer.outputColorSpace,
				toneMapping: renderer.toneMapping,
				toneMappingExposure: renderer.toneMappingExposure !== undefined ? renderer.toneMappingExposure : 1,
				shadows: renderer.shadowMap ? renderer.shadowMap.enabled : false,
				autoClear: renderer.autoClear,
				autoClearColor: renderer.autoClearColor,
				autoClearDepth: renderer.autoClearDepth,
				autoClearStencil: renderer.autoClearStencil,
				localClipping: renderer.localClippingEnabled,
				physicallyCorrectLights: renderer.physicallyCorrectLights || false, // Assuming false is default if undefined
				info: {
					render: {
						frame: renderer.info.render.frame,
						calls: renderer.info.render.calls,
						triangles: renderer.info.render.triangles,
						points: renderer.info.render.points,
						lines: renderer.info.render.lines,
						geometries: renderer.info.render.geometries,
						sprites: renderer.info.render.sprites
					},
					memory: {
						geometries: renderer.info.memory.geometries,
						textures: renderer.info.memory.textures,
						programs: renderer.info.programs ? renderer.info.programs.length : 0,
						renderLists: renderer.info.memory.renderLists,
						renderTargets: renderer.info.memory.renderTargets
					}
				}
			};

		}


		// Function to check if bridge is available
		function checkBridgeAvailability() {

			const devToolsValue = window.__THREE_DEVTOOLS__;

			// If we have devtools and we're interactive or complete, trigger ready
			if ( devToolsValue && ( document.readyState === 'interactive' || document.readyState === 'complete' ) ) {

				devTools.dispatchEvent( new CustomEvent( EVENT_DEVTOOLS_READY ) );

			}

		}

		// Watch for readyState changes
		document.addEventListener( 'readystatechange', () => {

			if ( document.readyState === 'loading' ) {

				devTools.reset();

			}

			checkBridgeAvailability();

		} );

		// Check if THREE is in the global scope (Old versions)
		window.addEventListener( 'load', () => {

			if ( window.THREE && window.THREE.REVISION ) {

				dispatchEvent( EVENT_REGISTER, { revision: THREE.REVISION } );

			}

		} );

		// Watch for page unload to reset state
		window.addEventListener( 'beforeunload', () => {

			devTools.reset();

		} );

		// Listen for messages from the content script
		window.addEventListener( 'message', function ( event ) {

			// Only accept messages from the same frame
			if ( event.source !== window ) return;

			const message = event.data;
			if ( ! message || message.id !== MESSAGE_ID ) return;

			// Handle request for initial state from panel
			if ( message.name === MESSAGE_REQUEST_STATE ) {

				sendState();

			} else if ( message.name === MESSAGE_REQUEST_OBJECT_DETAILS ) {

				sendObjectDetails( message.uuid );

			} else if ( message.name === MESSAGE_SCROLL_TO_CANVAS ) {

				scrollToCanvas( message.uuid );

			}

		} );

		function sendState() {

			// Send current renderers
			for ( const observedRenderer of observedRenderers ) {

				const data = getObjectData( observedRenderer );
				if ( data ) {

					data.properties = getRendererProperties( observedRenderer );
					dispatchEvent( EVENT_RENDERER, data );

				}

			}

			// Send current scenes
			for ( const observedScene of observedScenes ) {

				reloadSceneObjects( observedScene );

			}

		}

		function findObjectInScenes( uuid ) {

			for ( const scene of observedScenes ) {

				const found = scene.getObjectByProperty( 'uuid', uuid );
				if ( found ) return found;

			}

			return null;

		}

		function createHighlightOverlay( targetElement ) {

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

			// Position the overlay relative to the target
			const parent = targetElement.parentElement || document.body;

			if ( getComputedStyle( parent ).position === 'static' ) {

				parent.style.position = 'relative';

			}

			parent.appendChild( overlay );

			// Auto-remove after duration
			setTimeout( () => {

				if ( overlay.parentElement ) {

					overlay.parentElement.removeChild( overlay );

				}

			}, HIGHLIGHT_OVERLAY_DURATION );

		}

		function sendObjectDetails( uuid ) {

			const object = findObjectInScenes( uuid );

			if ( object ) {

				const details = {
					uuid: object.uuid,
					type: object.type,
					name: object.name,
					position: {
						x: object.position.x,
						y: object.position.y,
						z: object.position.z
					},
					rotation: {
						x: object.rotation.x,
						y: object.rotation.y,
						z: object.rotation.z
					},
					scale: {
						x: object.scale.x,
						y: object.scale.y,
						z: object.scale.z
					}
				};

				dispatchEvent( EVENT_OBJECT_DETAILS, details );

			}

		}

		function scrollToCanvas( uuid ) {

			let renderer = null;

			if ( uuid ) {

				// Find the renderer with the given UUID
				renderer = observedRenderers.find( r => r.uuid === uuid );

			} else {

				// If no UUID provided, find the first available renderer whose canvas is in the DOM
				renderer = observedRenderers.find( r => r.domElement && document.body.contains( r.domElement ) );

			}

			if ( renderer ) {

				// Scroll the canvas element into view
				renderer.domElement.scrollIntoView( {
					behavior: 'smooth',
					block: 'center',
					inline: 'center'
				} );

				// Add a brief blue overlay flash effect
				createHighlightOverlay( renderer.domElement );

			}

		}

		function dispatchEvent( name, detail ) {

			try {

				window.postMessage( {
					id: MESSAGE_ID,
					name: name,
					detail: detail
				}, '*' );

			} catch ( error ) {

				// If we get an "Extension context invalidated" error, stop all monitoring
				if ( error.message.includes( 'Extension context invalidated' ) ) {

					console.log( 'DevTools: Extension context invalidated, stopping monitoring' );
					devTools.reset();
					return;

				}

				console.warn( 'DevTools: Error dispatching event:', error );

			}

		}

		// Function to manually reload scene objects
		function reloadSceneObjects( scene ) {

			const batchObjects = [];

			traverseObjectTree( scene, ( object ) => {

				const objectData = getObjectData( object );
				if ( objectData ) {

					batchObjects.push( objectData ); // Add to batch
					// Update or add to local cache immediately
					devTools.objects.set( object.uuid, objectData );

				}

			} );

			// --- Caching Logic ---
			const currentObjectCount = batchObjects.length;
			const previousObjectCount = sceneObjectCountCache.get( scene.uuid );

			if ( currentObjectCount !== previousObjectCount ) {

				console.log( `DevTools: Scene ${scene.uuid} count changed (${previousObjectCount} -> ${currentObjectCount}), dispatching update.` );
				// Dispatch the batch update for the panel
				dispatchEvent( EVENT_SCENE, { sceneUuid: scene.uuid, objects: batchObjects } );
				// Update the cache
				sceneObjectCountCache.set( scene.uuid, currentObjectCount );

			}

		}

	}

} )();
