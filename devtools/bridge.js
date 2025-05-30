/**
 * This script injected by the installed three.js developer
 * tools extension.
 */

( function () {

	// Identify exporter URL passed via data-exporter-url on this script tag
	const EXPORTER_URL = (() => {
		const scripts = document.getElementsByTagName('script');
		for (let i = scripts.length - 1; i >= 0; i--) {
			const s = scripts[i];
			if (s.src && s.src.endsWith('bridge.js') && s.hasAttribute('data-exporter-url')) {
				return s.getAttribute('data-exporter-url');
			}
		}
		console.error('DevTools: exporter URL attribute not found on bridge script');
		return null;
	})();

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
				if ( type !== 'devtools-ready' && this._backlog.length > 0 ) {

					this.dispatchEvent( new CustomEvent( 'devtools-ready' ) );

				}

			}

			dispatchEvent( event ) {

				if ( this._ready || event.type === 'devtools-ready' ) {

					if ( event.type === 'devtools-ready' ) {

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

		// Function to get renderer data
		function getRendererData( renderer ) {

			try {

				const data = {
					uuid: renderer.uuid || generateUUID(),
					type: renderer.isWebGLRenderer ? 'WebGLRenderer' : 'WebGPURenderer',
					name: '',
					properties: getRendererProperties( renderer )
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
		devTools.addEventListener( 'register', ( event ) => {

			// console.log('DevTools: Three.js registered with revision:', event.detail.revision);
			dispatchEvent( 'register', event.detail );

		} );

		// Listen for object observations
		devTools.addEventListener( 'observe', ( event ) => {

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

					dispatchEvent( 'renderer', data );

				}

			} else if ( obj.isScene ) {

				observedScenes.push( obj );

				const batchObjects = [];
				const processedUUIDs = new Set();

				function traverseForBatch( currentObj ) {

					if ( ! currentObj || ! currentObj.uuid || processedUUIDs.has( currentObj.uuid ) ) return;
					processedUUIDs.add( currentObj.uuid );

					const objectData = getObjectData( currentObj );
					if ( objectData ) {

						batchObjects.push( objectData );
						devTools.objects.set( currentObj.uuid, objectData ); // Update local cache during batch creation

					}

					// Process children
					if ( currentObj.children && Array.isArray( currentObj.children ) ) {

						currentObj.children.forEach( child => traverseForBatch( child ) );

					}

				}

				traverseForBatch( obj ); // Start traversal from the scene

				dispatchEvent( 'scene', { sceneUuid: obj.uuid, objects: batchObjects } );

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

		// Start periodic renderer checks
		// console.log('DevTools: Starting periodic renderer checks');

		// Function to validate exported GLTF/GLB data
		function validateExport(data, binary) {
			return new Promise((resolve, reject) => {
				try {
					// Basic validation checks
					if (!data) {
						return resolve({ valid: false, errors: ['Export data is empty'] });
					}

					// For binary GLB
					if (binary) {
						if (!(data instanceof ArrayBuffer)) {
							return resolve({ valid: false, errors: ['Binary data is not an ArrayBuffer'] });
						}

						// Check GLB magic header (glTF)
						if (data.byteLength < 12) {
							return resolve({ valid: false, errors: ['GLB data too small to contain a valid header'] });
						}

						// Basic size check - typical scenes are at least a few KB
						if (data.byteLength < 100) {
							return resolve({ valid: false, errors: ['GLB data size is suspiciously small'] });
						}

						// GLB appears valid based on basic checks
						return resolve({ valid: true });
					}
					// For JSON GLTF
					else {
						let parsed;
						if (typeof data === 'string') {
							try {
								parsed = JSON.parse(data);
							} catch (e) {
								return resolve({ valid: false, errors: ['Invalid JSON: ' + e.message] });
							}
						} else {
							parsed = data;
						}

						// Check for required GLTF elements
						if (!parsed.asset || !parsed.asset.version) {
							return resolve({ valid: false, errors: ['Missing required GLTF asset version'] });
						}

						// Check for scenes
						if (!parsed.scenes || !Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
							return resolve({ valid: false, errors: ['No scenes found in GLTF data'] });
						}

						return resolve({ valid: true });
					}
				} catch (e) {
					console.error('DevTools: Error during validation:', e);
					resolve({ valid: false, errors: ['Validation error: ' + e.message] });
				}
			});
		}

		// Function to check if bridge is available
		function checkBridgeAvailability() {

			const hasDevTools = window.hasOwnProperty( '__THREE_DEVTOOLS__' );
			const devToolsValue = window.__THREE_DEVTOOLS__;

			// If we have devtools and we're interactive or complete, trigger ready
			if ( hasDevTools && devToolsValue && ( document.readyState === 'interactive' || document.readyState === 'complete' ) ) {

				devTools.dispatchEvent( new CustomEvent( 'devtools-ready' ) );

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

			if ( window.THREE && window.THREE.REVISION) {
	
				dispatchEvent( 'register', { revision: THREE.REVISION } );
	
			}
	
		} );

		// Watch for page unload to reset state
		window.addEventListener( 'beforeunload', () => {

			devTools.reset();

		} );

		// Listen for messages from the content script

		window.addEventListener('message', function (event) {

			// Only accept messages from the same frame
			if ( event.source !== window ) return;

			const message = event.data;
			if ( ! message || message.id !== 'three-devtools' ) return;

			// Handle request for initial state from panel

			if (message.name === 'request-state') {
				sendState();
			} else if (message.name === 'export-scene') {
				const { sceneUuid, binary } = message;

				try {
						// Handle special case for Planner5D
						const isPlanner5D = window.location.href.includes('planner5d.com');

						// For Planner5D, we'll use a more robust scene finding approach
						let scene = null;

						// First try the normal approach - find in our observed scenes
						scene = observedScenes.find(s => s.uuid === sceneUuid);

						// If scene not found and it's Planner5D, try alternative methods to locate the scene
						if (!scene && isPlanner5D) {
							console.log('DevTools: Scene not found in observedScenes on Planner5D, trying alternative detection...');

							// Method 1: Look for active scenes in the global THREE namespace if available
							if (window.THREE && window.THREE.Scene) {
								// Find scenes that might be in the THREE object itself
								for (const prop in window.THREE) {
									if (window.THREE[prop] &&
										window.THREE[prop].isScene &&
										window.THREE[prop].children &&
										window.THREE[prop].children.length > 0) {
										console.log('DevTools: Found potential scene in THREE namespace:', window.THREE[prop].uuid);
										scene = window.THREE[prop];
										break;
									}
								}
							}

							// Method 2: Look through the Planner5D app's own rendering engine if available
							if (!scene && window.Planner5D) {
								console.log('DevTools: Searching through Planner5D rendering engine...');
								// Attempt to find scenes in common Planner5D properties based on their API structure
								const p5dProps = ['viewer', 'engine', 'renderer', 'scene', 'model'];
								for (const prop of p5dProps) {
									if (window.Planner5D[prop] && window.Planner5D[prop].scene) {
										scene = window.Planner5D[prop].scene;
										console.log('DevTools: Found scene through Planner5D.' + prop + '.scene');
										break;
									}
								}
							}

							// Method 3: Look for scenes stored in the global scope
							if (!scene) {
								// Find any Scene objects in the global window context
								for (const prop in window) {
									try {
										if (window[prop] &&
											typeof window[prop] === 'object' &&
											window[prop].isScene &&
											window[prop].children &&
											window[prop].children.length > 0) {
											console.log('DevTools: Found scene in global scope:', prop, window[prop].uuid);
											scene = window[prop];
											break;
										}
									} catch (e) {
										// Ignore errors when accessing some properties that might be restricted
									}
								}
							}

							// Method 4: Find the primary renderer and get its scene from there
							if (!scene && observedRenderers.length > 0) {
								for (const renderer of observedRenderers) {
									// Many Three.js applications keep a reference to the scene in the renderer or store it in a closure
									// Try accessing the scene if the renderer has a reference to it
									if (renderer._currentScene) {
										scene = renderer._currentScene;
										console.log('DevTools: Found scene through renderer._currentScene:', scene.uuid);
										break;
									} else if (renderer.info && renderer.info._scene) {
										scene = renderer.info._scene;
										console.log('DevTools: Found scene through renderer.info._scene:', scene.uuid);
										break;
									}
								}
							}

							// Method 5: If we found one scene originally, use that even if UUIDs don't match
							// This helps when scene UUIDs change during app lifecycle
							if (!scene && observedScenes.length === 1) {
								scene = observedScenes[0];
								console.log('DevTools: Using the only observed scene:', scene.uuid);
							}

							// Method 6: Find the scene with the most objects (likely the main scene)
							if (!scene && observedScenes.length > 1) {
								let maxObjects = 0;
								for (const obsScene of observedScenes) {
									const objectCount = obsScene.children ? obsScene.children.length : 0;
									if (objectCount > maxObjects) {
										maxObjects = objectCount;
										scene = obsScene;
									}
								}
								if (scene) {
									console.log('DevTools: Using scene with most objects:', scene.uuid);
								}
							}
						}

						// If we still couldn't find the scene, report error and return
						if (!scene) {
							console.error('DevTools: Scene not found for export:', sceneUuid, 'Available scenes:', observedScenes.length);
							dispatchEvent('export-error', {
								sceneUuid,
								error: `Scene not found for export: ${sceneUuid}. Try refreshing the page and reopening DevTools.`
							});
							return;
						}

					// Load GLTFExporter as ES module via dynamic import
					function loadExporter(callback) {
						if (!EXPORTER_URL) {
							console.error('DevTools: exporter URL not set');
							return;
						}
						import(EXPORTER_URL)
							.then(module => {
								window.GLTFExporterClass = module.GLTFExporter;
								callback(module.GLTFExporter);
							})
							.catch(error => console.error('DevTools: Failed to load local GLTFExporter:', error));
					}

					loadExporter((GLTFExporter) => {
						try {
							console.log('DevTools: Starting export of scene', sceneUuid, 'as', binary ? 'GLB' : 'GLTF');

							// Create a deep clone of the scene for export if needed
							let exportScene = scene;

							// Pre-process scene to ensure compatibility with other programs
							function prepareSceneForExport(originalScene) {
								console.log('DevTools: Preparing scene for export...');

								// Create a clone of the scene to avoid modifying the original
								const clonedScene = originalScene.clone();

								// Fix common issues that prevent successful export
								const problemMaterials = [];
								const problemGeometries = [];

								// Track processed objects to avoid infinite recursion
								const processedObjects = new Set();

								// Process all objects in the scene to fix common issues
								function processObject(object) {
									if (processedObjects.has(object.uuid)) {
										return;
									}
									processedObjects.add(object.uuid);

									// Fix Mesh issues
									if (object.isMesh) {
										// Fix missing normals (a common issue)
										if (object.geometry && !object.geometry.attributes.normal) {
											try {
												object.geometry.computeVertexNormals();
												console.log('DevTools: Added missing normals to mesh:', object.name || object.uuid);
											} catch (e) {
												console.warn('DevTools: Could not compute normals for mesh:', object.name || object.uuid);
												problemGeometries.push(object.uuid);
											}
										}

										// Fix material issues
										if (object.material) {
											const materials = Array.isArray(object.material) ? object.material : [object.material];

											materials.forEach(material => {
												// Check for broken texture references
												const textureProps = [
													'map', 'normalMap', 'roughnessMap', 'metalnessMap',
													'emissiveMap', 'bumpMap', 'displacementMap',
													'aoMap', 'envMap', 'lightMap'
												];

												for (const prop of textureProps) {
													if (material[prop] && (!material[prop].image || material[prop].image.width === 0)) {
														console.warn(`DevTools: Removing invalid ${prop} texture from material`, material.uuid);
														material[prop] = null;
														problemMaterials.push(material.uuid);
													}
												}

												// Fix NaN values in material properties
												const numberProps = ['roughness', 'metalness', 'opacity', 'emissiveIntensity'];
												for (const prop of numberProps) {
													if (material[prop] !== undefined && (isNaN(material[prop]) || !isFinite(material[prop]))) {
														console.warn(`DevTools: Fixing invalid ${prop} value in material`, material.uuid);
														// Set reasonable defaults
														switch (prop) {
															case 'roughness': material[prop] = 0.5; break;
															case 'metalness': material[prop] = 0.0; break;
															case 'opacity': material[prop] = 1.0; break;
															case 'emissiveIntensity': material[prop] = 1.0; break;
															default: material[prop] = 0;
														}
														problemMaterials.push(material.uuid);
													}
												}
											});
										}
									}

									// Process children
									if (object.children) {
										object.children.forEach(child => processObject(child));
									}
								}

								// Start processing from the scene root
								processObject(clonedScene);

								if (problemMaterials.length > 0 || problemGeometries.length > 0) {
									console.warn(`DevTools: Fixed ${problemMaterials.length} material(s) and ${problemGeometries.length} geometry/geometries during scene preparation`);
								} else {
									console.log('DevTools: Scene preparation complete - no issues found');
								}

								return clonedScene;
							}

							// Prepare the scene for export
							exportScene = prepareSceneForExport(scene);

							if (isPlanner5D) {
								console.log('DevTools: Detected Planner5D - using special export handling');
								// For Planner5D, we might need specific options
								// or scene preparation to avoid issues
							}

							// Create TextureUtils if available - needed for proper texture handling
							let textureUtils = null;
							if (window.THREE && window.THREE.WebGLRenderer) {
								try {
									// Create a temporary renderer for texture processing
									const tempRenderer = new window.THREE.WebGLRenderer({antialias: false});
									tempRenderer.setSize(1, 1);
									tempRenderer.outputColorSpace = 'srgb';

									// If there's a TextureUtils module available in the page
									if (window.TextureUtils) {
										textureUtils = window.TextureUtils;
									} else if (window.THREE.TextureUtils) {
										textureUtils = window.THREE.TextureUtils;
									}

									if (textureUtils) {
										console.log('DevTools: Found TextureUtils for better texture export');
									}

									// Clean up
									tempRenderer.dispose();
								} catch (e) {
									console.warn('DevTools: Could not create temporary renderer:', e);
								}
							}

							// Configure exporter with optimal settings
							const exporter = new GLTFExporter();
							if (textureUtils) {
								exporter.setTextureUtils(textureUtils);
							}

							const exportOptions = {
								binary,
								// Enhanced options for better compatibility
								trs: true, // Use TRS instead of matrices for better compatibility
								onlyVisible: true,
								maxTextureSize: 4096,
								embedImages: true, // Embed all images in the file for better portability
								includeCustomExtensions: false, // Safer to exclude custom extensions for compatibility
								animations: [], // No animations by default but can be added if needed
							};

							// Use try-catch for both export approaches
							if (typeof exporter.parseAsync === 'function') {
								// Modern approach with promises
								exporter.parseAsync(exportScene, exportOptions)
									.then(result => {
										createDownload(result);
									})
									.catch(error => {
										console.error('DevTools: Error during async export:', error);
										dispatchEvent('export-error', {
											sceneUuid,
											error: error.toString()
										});
									});
							} else {
								// Older callback approach
								try {
									exporter.parse(exportScene,
										function(result) {
											createDownload(result);
										},
										function(error) {
											console.error('DevTools: Error during export:', error);
											dispatchEvent('export-error', {
												sceneUuid,
												error: error.toString()
											});
										},
										exportOptions
									);
								} catch (parseError) {
									console.error('DevTools: Exception during export setup:', parseError);
									dispatchEvent('export-error', {
										sceneUuid,
										error: parseError.toString()
									});
								}
							}

							// Function to handle the download process
							function createDownload(result) {
								// Generate a unique filename with timestamp
								const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
								const filename = binary ? `scene-${timestamp}.glb` : `scene-${timestamp}.gltf`;

								try {
									// Validate the exported file before attempting to download
									validateExport(result, binary).then(validationResult => {
										if (!validationResult.valid) {
											console.error('DevTools: GLTF/GLB validation failed:', validationResult.errors);
											dispatchEvent('export-error', {
												sceneUuid,
												error: `Validation failed: ${validationResult.errors.join(', ')}`
											});
											return;
										}

										console.log('DevTools: GLTF/GLB validation passed!');

										// Check if we're dealing with binary data
										if (binary) {
											if (!(result instanceof ArrayBuffer)) {
												console.error('DevTools: Expected ArrayBuffer for binary export but got:', typeof result);
												return;
											}

											// For GLB (binary), ensure we're handling the ArrayBuffer correctly
											const blob = new Blob([result], { type: 'model/gltf-binary' });
											downloadWithBlob(blob, filename);
										} else {
											// For GLTF (JSON), ensure proper formatting
											let jsonData;
											if (typeof result === 'string') {
												// Already a string, validate it's proper JSON
												try {
													JSON.parse(result); // Just validate, don't actually use the parsed result
													jsonData = result;
												} catch (e) {
													console.error('DevTools: Invalid JSON in GLTF export:', e);
													return;
												}
											} else if (typeof result === 'object') {
												// Convert object to formatted JSON string
												try {
													jsonData = JSON.stringify(result, null, 2);
												} catch (e) {
													console.error('DevTools: Failed to stringify GLTF object:', e);
													return;
												}
											} else {
												console.error('DevTools: Unexpected GLTF data type:', typeof result);
												return;
											}

											const blob = new Blob([jsonData], { type: 'application/json' });
											downloadWithBlob(blob, filename);
										}
									}).catch(validationError => {
										console.error('DevTools: Error during validation:', validationError);
										dispatchEvent('export-error', {
											sceneUuid,
											error: `Validation error: ${validationError.message}`
										});
									});
								} catch (error) {
									console.error('DevTools: Error during file creation/download:', error);
									dispatchEvent('export-error', {
										sceneUuid,
										error: `Download error: ${error.message}`
									});
									}

								// Helper function to handle the actual download
								function downloadWithBlob(blob, filename) {
									try {
										// For GLB files, ensure we're using the correct MIME type
										if (filename.endsWith('.glb')) {
											// Create a new blob with the correct MIME type
											// Some viewers are strict about the MIME type
											blob = new Blob([blob], {
												type: 'model/gltf-binary'  // Standardized MIME type for GLB
											});
										} else if (filename.endsWith('.gltf')) {
											// For GLTF JSON files, ensure we're using the correct MIME type
											blob = new Blob([blob], {
												type: 'model/gltf+json'  // Standardized MIME type for GLTF
											});
										}

										// Add a small delay before creating the download
										// to ensure the blob is fully ready
										setTimeout(() => {
											// Create a download link and trigger it directly in this context
											const a = document.createElement('a');
											const url = URL.createObjectURL(blob);
											a.href = url;
											a.download = filename;
											a.style.display = 'none';
											document.body.appendChild(a);

											// Add some debugging info about the blob
											const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
											console.log(`DevTools: Created blob for download: ${filename}, type: ${blob.type}, size: ${sizeMB} MB`);

											// Some browsers need the element to be in the DOM for a bit before clicking
											setTimeout(() => {
												try {
													a.click();

													// Clean up with another timeout to ensure download starts properly
													setTimeout(() => {
														try {
															document.body.removeChild(a);
															URL.revokeObjectURL(url);
															console.log(`DevTools: Download cleanup complete for ${filename}`);
														} catch (cleanupError) {
															console.warn('DevTools: Error during cleanup:', cleanupError);
														}
													}, 2000); // Longer cleanup timeout

													// Notify panel about the successful export
													dispatchEvent('export-complete', {
														sceneUuid,
														binary,
														size: blob.size
													});
												} catch (clickError) {
													console.error('DevTools: Error triggering download:', clickError);

													// Try alternative download approach for problematic sites
													if (isPlanner5D) {
														console.log('DevTools: Trying alternative download method for Planner5D');
														try {
															// Send the download data to background script
															window.postMessage({
																id: 'three-devtools',
																type: 'request-background-download',
																detail: {
																	sceneUuid,
																	binary,
																	filename,
																	dataUrl: url,
																	blob: blob
																}
															}, '*');
														} catch (altError) {
															console.error('DevTools: Alternative download method failed:', altError);
														}
													}
												}
											}, 200);  // Increased delay before clicking
										}, 100);  // Delay before creating the download link
									} catch (downloadError) {
										console.error('DevTools: Error setting up download:', downloadError);
									}
								}
							}
						} catch (error) {
							console.error('DevTools: Error setting up export:', error);
						}
					});
				} catch (outerError) {
					console.error('DevTools: Critical error during export process:', outerError);
				}
			}
		});


		function sendState() {

			// Send current renderers
			for ( const observedRenderer of observedRenderers ) {

				const data = getObjectData( observedRenderer );
				if ( data ) {

					data.properties = getRendererProperties( observedRenderer );
					dispatchEvent( 'renderer', data );

				}

			}

			// Send current scenes
			for ( const observedScene of observedScenes ) {

				reloadSceneObjects( observedScene );

			}

		}


		function dispatchEvent(type, detail) {
			// More selective logging to prevent large object dumps in the console
			if (type === 'export-result-meta') {
				// For large exports, just log the type and basic info, not the full detail object
				console.log('DevTools Bridge: dispatchEvent', type, {
					sceneUuid: detail.sceneUuid,
					binary: detail.binary,
					size: (detail.size / (1024 * 1024)).toFixed(2) + ' MB'
				});
			} else if (type === 'export-result') {
				// For export results, just log the type and basic info, not the actual result data
				console.log('DevTools Bridge: dispatchEvent', type, {
					sceneUuid: detail.sceneUuid,
					binary: detail.binary,
					size: detail.result instanceof ArrayBuffer
						? (detail.result.byteLength / (1024 * 1024)).toFixed(2) + ' MB'
						: (detail.result.length / (1024 * 1024)).toFixed(2) + ' MB'
				});
			} else if (type === 'scene') {
				// For scenes, just log the scene ID and object count, not the entire object list
				console.log('DevTools Bridge: dispatchEvent', type, {
					sceneUuid: detail.sceneUuid,
					objectCount: detail.objects?.length || 0
				});
			} else if (type === 'renderer') {
				// For renderers, just log the basic info
				console.log('DevTools Bridge: dispatchEvent', type, {
					uuid: detail.uuid,
					type: detail.type
				});
			} else {
				// For other event types, log with minimal info
				console.log('DevTools Bridge: dispatchEvent', type);
			}

			try {
				window.postMessage({

					id: 'three-devtools',
					name: name,
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

		// Function to manually reload scene objects
		function reloadSceneObjects( scene ) {

			const batchObjects = [];

			// Recursively observe all objects, collect data, update local cache
			function observeAndBatchObject( object ) {

				if ( ! object || ! object.uuid ) return; // Simplified check

				// console.log('DevTools: Processing object during reload:', object.type || object.constructor.name, object.uuid);

				// Get object data
				const objectData = getObjectData( object );
				if ( objectData ) {

					batchObjects.push( objectData ); // Add to batch
					// Update or add to local cache immediately
					devTools.objects.set( object.uuid, objectData );

				}

				// Process children recursively
				if ( object.children && Array.isArray( object.children ) ) {

					// console.log('DevTools: Processing', object.children.length, 'children of', object.type || object.constructor.name);
					object.children.forEach( child => observeAndBatchObject( child ) );

				}

			}

			// Start traversal from the scene itself
			observeAndBatchObject( scene );

			// --- Caching Logic ---
			const currentObjectCount = batchObjects.length;
			const previousObjectCount = sceneObjectCountCache.get( scene.uuid );

			if ( currentObjectCount !== previousObjectCount ) {


				console.log( `DevTools: Scene ${scene.uuid} count changed (${previousObjectCount} -> ${currentObjectCount}), dispatching update.` );

				// Dispatch the batch update for the panel as 'scene'
				dispatchEvent( 'scene', { sceneUuid: scene.uuid, objects: batchObjects } );
				// Update the cache
				sceneObjectCountCache.set( scene.uuid, currentObjectCount );

			} else {
				// console.log(`DevTools: Scene ${scene.uuid} count unchanged (${currentObjectCount}), skipping dispatch.`);
			}

		}

	}

} )();
