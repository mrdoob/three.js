/**
 * This script injected by the installed three.js developer
 * tools extension.
 */

// Only initialize if not already initialized
if (!window.__THREE_DEVTOOLS__) {
	// Create our custom EventTarget with logging
	class DevToolsEventTarget extends EventTarget {
		constructor() {
			super();
			this._ready = false;
			this._backlog = [];
			this.objects = new Map();
		}

		addEventListener(type, listener, options) {
			super.addEventListener(type, listener, options);

			// If this is the first listener for a type, and we have backlogged events,
			// check if we should process them
			if (type !== 'devtools-ready' && this._backlog.length > 0) {
				this.dispatchEvent(new CustomEvent('devtools-ready'));
			}
		}

		dispatchEvent(event) {
			if (this._ready || event.type === 'devtools-ready') {
				if (event.type === 'devtools-ready') {
					this._ready = true;
					const backlog = this._backlog;
					this._backlog = [];
					backlog.forEach(e => super.dispatchEvent(e));
				}
				return super.dispatchEvent(event);
			} else {
				this._backlog.push(event);
				return false; // Return false to indicate synchronous handling
			}
		}

		reset() {
			// console.log('DevTools: Resetting state');
			
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
	Object.defineProperty(window, '__THREE_DEVTOOLS__', {
		value: devTools,
		configurable: false,
		enumerable: true,
		writable: false
	});

	// Declare arrays for tracking observed objects
	const observedScenes = [];
	const observedRenderers = [];

	// Function to get renderer data
	function getRendererData(renderer) {
		try {
			const webglInfo = getWebGLInfo(renderer);
			const data = {
				uuid: renderer.uuid || generateUUID(),
				type: 'WebGLRenderer',
				name: '',
				visible: true,
				isScene: false,
				isObject3D: false,
				isCamera: false,
				isLight: false,
				isMesh: false,
				isRenderer: true,
				parent: null,
				children: [],
				properties: {
					width: renderer.domElement ? renderer.domElement.clientWidth : 0,
					height: renderer.domElement ? renderer.domElement.clientHeight : 0,
					drawingBufferWidth: renderer.domElement ? renderer.domElement.width : 0,
					drawingBufferHeight: renderer.domElement ? renderer.domElement.height : 0,
					alpha: renderer.alpha || false,
					antialias: renderer.antialias || false,
					autoClear: renderer.autoClear,
					autoClearColor: renderer.autoClearColor,
					autoClearDepth: renderer.autoClearDepth,
					autoClearStencil: renderer.autoClearStencil,
					localClippingEnabled: renderer.localClippingEnabled,
					physicallyCorrectLights: renderer.physicallyCorrectLights,
					outputColorSpace: renderer.outputColorSpace,
					toneMapping: renderer.toneMapping,
					toneMappingExposure: renderer.toneMappingExposure,
					shadowMapEnabled: renderer.shadowMap ? renderer.shadowMap.enabled : false,
					shadowMapType: renderer.shadowMap ? renderer.shadowMap.type : 'None',
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
						},
						webgl: webglInfo || {
							version: 'unknown',
							gpu: 'unknown',
							vendor: 'unknown',
							maxTextures: 'unknown',
							maxAttributes: 'unknown',
							maxTextureSize: 'unknown',
							maxCubemapSize: 'unknown'
						}
					}
				}
			};
			return data;
		} catch (error) {
			console.warn('DevTools: Error getting renderer data:', error);
			return null;
		}
	}

	// Function to get object hierarchy
	function getObjectData(obj) {
		try {
			// Special case for WebGLRenderer
			if (obj.isWebGLRenderer === true) {
				return getRendererData(obj);
			}

			// Get descriptive name for the object
			let name = obj.name || obj.type || obj.constructor.name;
			if (obj.isMesh) {
				const geoType = obj.geometry ? obj.geometry.type : 'Unknown';
				const matType = obj.material ? 
					(Array.isArray(obj.material) ? 
						obj.material.map(m => m.type).join(', ') : 
						obj.material.type) : 
					'Unknown';
				name = `${name} <span class="object-details">${geoType} ${matType}</span>`;
			}

			const data = {
				uuid: obj.uuid,
				type: obj.type || obj.constructor.name,
				name: name,
				visible: obj.visible !== undefined ? obj.visible : true,
				isScene: obj.isScene === true,
				isObject3D: obj.isObject3D === true,
				isCamera: obj.isCamera === true,
				isLight: obj.isLight === true,
				isMesh: obj.isMesh === true,
				isRenderer: obj.isWebGLRenderer === true,
				parent: obj.parent ? obj.parent.uuid : null,
				children: obj.children ? obj.children.map(child => child.uuid) : []
			};
			
			return data;
		} catch (error) {
			console.warn('DevTools: Error getting object data:', error);
			return null;
		}
	}

	// Generate a UUID for objects that don't have one
	function generateUUID() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	// Listen for Three.js registration
	devTools.addEventListener('register', (event) => {
		// console.log('DevTools: Three.js registered with revision:', event.detail.revision);
		dispatchEvent('register', event.detail);
	});

	// Listen for object observations
	devTools.addEventListener('observe', (event) => {
		const obj = event.detail;
		if (!obj) {
			console.warn('DevTools: Received observe event with null/undefined detail');
			return;
		}
		
		// Generate UUID if needed
		if (!obj.uuid) {
			obj.uuid = generateUUID();
		}
		
		// Skip if already registered (essential to prevent loops with batching)
		if (devTools.objects.has(obj.uuid)) {
			return;
		}
		
		// Handle Renderers individually
		if (obj.isWebGLRenderer) {
			const data = getObjectData(obj);
			if (data) {
				data.properties = getRendererProperties(obj);
				observedRenderers.push(obj);
				devTools.objects.set(obj.uuid, data); // Store locally
				dispatchEvent('renderer', data); // Send to panel as 'renderer'
			}
		} 
		// Handle Scenes via batch
		else if (obj.isScene) {
			// Don't add scene to devTools.objects here yet, batch will handle it
			observedScenes.push(obj); // Track the scene object

			const batchObjects = [];
			const processedUUIDs = new Set();

			function traverseForBatch(currentObj) {
				if (!currentObj || !currentObj.uuid || processedUUIDs.has(currentObj.uuid)) return;
				processedUUIDs.add(currentObj.uuid);

				const objectData = getObjectData(currentObj);
				if (objectData) {
					batchObjects.push(objectData);
					devTools.objects.set(currentObj.uuid, objectData); // Update local cache during batch creation
				}
				// Process children
				if (currentObj.children && Array.isArray(currentObj.children)) {
					currentObj.children.forEach(child => traverseForBatch(child));
				}
			}

			traverseForBatch(obj); // Start traversal from the scene
			
			// Dispatch the batch as 'scene'
			dispatchEvent('scene', { sceneUuid: obj.uuid, objects: batchObjects });
		} 
		// Ignore other object types arriving directly via 'observe'? 
		// They should be discovered via scene traversal.
	});

	// Function to get renderer properties
	function getRendererProperties(renderer) {
		const webglInfo = getWebGLInfo(renderer);
		const context = renderer.getContext ? renderer.getContext() : null;
		const contextAttributes = context ? context.getContextAttributes() : null;
		return {
			width: renderer.domElement ? renderer.domElement.clientWidth : 0,
			height: renderer.domElement ? renderer.domElement.clientHeight : 0,
			drawingBufferWidth: renderer.domElement ? renderer.domElement.width : 0,
			drawingBufferHeight: renderer.domElement ? renderer.domElement.height : 0,
			alpha: contextAttributes ? contextAttributes.alpha : false,
			antialias: contextAttributes ? contextAttributes.antialias : false,
			autoClear: renderer.autoClear,
			autoClearColor: renderer.autoClearColor,
			autoClearDepth: renderer.autoClearDepth,
			autoClearStencil: renderer.autoClearStencil,
			localClippingEnabled: renderer.localClippingEnabled,
			physicallyCorrectLights: renderer.physicallyCorrectLights,
			outputColorSpace: renderer.outputColorSpace,
			toneMapping: renderer.toneMapping,
			toneMappingExposure: renderer.toneMappingExposure,
			shadowMapEnabled: renderer.shadowMap ? renderer.shadowMap.enabled : false,
			shadowMapType: renderer.shadowMap ? renderer.shadowMap.type : 'None',
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
				},
				webgl: webglInfo || {
					version: 'unknown',
					gpu: 'unknown',
					vendor: 'unknown',
					maxTextures: 'unknown',
					maxAttributes: 'unknown',
					maxTextureSize: 'unknown',
					maxCubemapSize: 'unknown'
				}
			}
		};
	}

	// Start periodic renderer checks
	// console.log('DevTools: Starting periodic renderer checks');

	// Function to check if bridge is available
	function checkBridgeAvailability() {
		const hasDevTools = window.hasOwnProperty('__THREE_DEVTOOLS__');
		const devToolsValue = window.__THREE_DEVTOOLS__;

		// If we have devtools and we're interactive or complete, trigger ready
		if (hasDevTools && devToolsValue && (document.readyState === 'interactive' || document.readyState === 'complete')) {
			devTools.dispatchEvent(new CustomEvent('devtools-ready'));
		}
	}

	// Watch for readyState changes
	document.addEventListener('readystatechange', () => {
		if (document.readyState === 'loading') {
			devTools.reset();
		}
		checkBridgeAvailability();
	});

	// Watch for page unload to reset state
	window.addEventListener('beforeunload', () => {
		devTools.reset();
	});

	// Listen for messages from the content script
	window.addEventListener('message', function(event) {
		// Only accept messages from the same frame
		if (event.source !== window) return;

		const message = event.data;
		if (!message || message.id !== 'three-devtools') return;

		// Handle traverse request
		if (message.name === 'traverse' && message.uuid) {
			const scene = Array.from(devTools.objects.values())
				.find(obj => obj.uuid === message.uuid && obj.isScene);
			
			if (scene) {
				console.log('DevTools: Re-traversing scene:', scene.uuid);
				// Find the actual scene object in the page
				const actualScene = findObjectByUUID(message.uuid);
				if (actualScene) {
					reloadSceneObjects(actualScene);
				}
			}
		}
		// Handle reload-scene request
		else if (message.name === 'reload-scene' && message.uuid) {
			console.log('DevTools: Received reload request for scene:', message.uuid);
			const actualScene = findObjectByUUID(message.uuid);
			if (actualScene) {
				reloadSceneObjects(actualScene);
			} else {
				console.warn('DevTools: Could not find scene for reload:', message.uuid);
			}
		}
		// Handle visibility toggle
		else if (message.name === 'visibility' && message.uuid !== undefined) {
			toggleVisibility(message.uuid, message.visible);
		}
		// Handle request for initial state from panel
		else if ( message.name === 'request-initial-state' ) {
			for (const observedRenderer of observedRenderers) {
				const data = getObjectData(observedRenderer);
				if (data) {
					data.properties = getRendererProperties(observedRenderer);
					dispatchEvent('renderer', data);
				}
			}
			for (const observedScene of observedScenes) {
				reloadSceneObjects(observedScene);
			}
		}
	});

	// Helper function to find a Three.js object by UUID
	function findObjectByUUID(uuid) {
		console.log('DevTools: Finding object by UUID:', uuid);
		
		// Check for scenes we've observed
		const sceneData = Array.from(devTools.objects.values())
			.find(obj => obj.uuid === uuid && obj.isScene);
		
		if (sceneData) {
			// For scenes accessed through observe events, they are already available
			// through the scene object reference passed to the observe handler
			for (const observedScene of observedScenes) {
				if (observedScene && observedScene.uuid === uuid) {
					console.log('DevTools: Found scene in observed scenes');
					return observedScene;
				}
			}
		}
		
		console.warn('DevTools: Could not find object with UUID:', uuid);
		return null;
	}

	function dispatchEvent(type, detail) {
		try {
			window.postMessage({
				id: 'three-devtools',
				type: type,
				detail: detail
			}, '*');
		} catch (error) {
			// If we get an "Extension context invalidated" error, stop all monitoring
			if (error.message.includes('Extension context invalidated')) {
				console.log('DevTools: Extension context invalidated, stopping monitoring');
				devTools.reset();
				return;
			}
			console.warn('DevTools: Error dispatching event:', error);
		}
	}

	function getWebGLInfo(renderer) {
		if (!renderer || !renderer.domElement) return null;
		
		const gl = renderer.domElement.getContext('webgl2') || renderer.domElement.getContext('webgl');
		if (!gl) return null;

		return {
			version: gl.getParameter(gl.VERSION),
			gpu: gl.getParameter(gl.RENDERER),
			vendor: gl.getParameter(gl.VENDOR),
			maxTextures: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
			maxAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxCubemapSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE)
		};
	}

	// Add visibility toggle function
	function toggleVisibility(uuid, visible) {
		// Update our local state
		const obj = devTools.objects.get(uuid);
		if (!obj) return;
		
		obj.visible = visible;
		console.log('DevTools: Setting visibility of', obj.type || obj.constructor.name, 'to', visible);
		
		// Find the actual Three.js object using our observed scenes
		if (observedScenes.length > 0) {
			for (const scene of observedScenes) {
				let found = false;
				scene.traverse((object) => {
					if (object.uuid === uuid) {
						object.visible = visible;
						// If it's a light, update its helper visibility too
						if (object.isLight && object.helper) {
							object.helper.visible = visible;
						}
						found = true;
						console.log('DevTools: Updated visibility in scene object');
					}
				});
				if (found) break;
			}
		} else {
			console.warn('DevTools: No observed scenes found for visibility toggle');
		}
	}

	// Function to manually reload scene objects
	function reloadSceneObjects(scene) {
		// console.log('DevTools: Manually reloading scene objects for scene:', scene.uuid);
				
		const batchObjects = [];
		const processedUUIDs = new Set(); // Track processed objects within this refresh
		const currentUUIDsInScene = new Set(); // Track objects found in this traversal

		// Temporarily store old UUIDs known to be under this scene to detect removals
		const oldUUIDsInScene = new Set();
		devTools.objects.forEach((objData, uuid) => {
			if (!objData.isRenderer && (objData.uuid === scene.uuid || objData.parent === scene.uuid)) { // Simple check, might need recursive parent check for deeper trees
				oldUUIDsInScene.add(uuid);
			}
		});

		// Recursively observe all objects, collect data, update local cache
		function observeAndBatchObject(object) {
			if (!object || !object.uuid || processedUUIDs.has(object.uuid)) return;
			processedUUIDs.add(object.uuid);
			currentUUIDsInScene.add(object.uuid); // Mark as present
			
			// console.log('DevTools: Processing object during reload:', object.type || object.constructor.name, object.uuid);
			
			// Get object data
			const objectData = getObjectData(object);
			if (objectData) {
				batchObjects.push(objectData); // Add to batch
				// Update or add to local cache immediately
				devTools.objects.set(object.uuid, objectData);
			}
			
			// Process children recursively
			if (object.children && Array.isArray(object.children)) {
				// console.log('DevTools: Processing', object.children.length, 'children of', object.type || object.constructor.name);
				object.children.forEach(child => observeAndBatchObject(child));
			}
		}
		
		// Start traversal from the scene itself
		observeAndBatchObject(scene);
		
		// Dispatch the batch update for the panel as 'scene'
		dispatchEvent('scene', { sceneUuid: scene.uuid, objects: batchObjects });

		// TODO: Optionally, detect and dispatch 'remove' events here?
		// For now, panel handles removal implicitly based on batch content.
		
		// console.log('DevTools: Scene reload batch dispatched. Processed', processedUUIDs.size, 'objects');
	}

} else {

	// console.log('DevTools: Bridge already initialized');

} 