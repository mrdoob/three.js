/**
 * This script injected by the installed three.js developer
 * tools extension.
 */

( function () {

	const EXPORTER_URL = ( () => {

		const scripts = document.getElementsByTagName( 'script' );
		for ( let i = scripts.length - 1; i >= 0; i -- ) {

			const s = scripts[ i ];
			if ( s.src && s.src.endsWith( 'bridge.js' ) && s.hasAttribute( 'data-exporter-url' ) ) {

				return s.getAttribute( 'data-exporter-url' );

			}

		}

		console.error( 'DevTools: exporter URL attribute not found on bridge script' );
		return null;

	} )();

	const THREE_URL = ( () => {

		const scripts = document.getElementsByTagName( 'script' );
		for ( let i = scripts.length - 1; i >= 0; i -- ) {

			const s = scripts[ i ];
			if ( s.src && s.src.endsWith( 'bridge.js' ) && s.hasAttribute( 'data-three-url' ) ) {

				return s.getAttribute( 'data-three-url' );

			}

		}

		console.error( 'DevTools: three.js URL attribute not found on bridge script' );
		return null;

	} )();

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

			console.log( 'DevTools: Three.js registered with revision:', event.detail.revision );
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

					//dispatchEvent( 'renderer', data );

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

			if ( window.THREE && window.THREE.REVISION ) {

				dispatchEvent( 'register', { revision: THREE.REVISION } );

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

			if ( ! message || message.id !== 'three-devtools' ) return;

			// Handle request for initial state from panel
			if ( message.name === 'request-state' ) {

				sendState();

			} else if ( message.name === 'export-scene' ) {

				console.log( 'Three.js DevTools: bridge.js received export-scene message:', message );
				const { sceneUuid, binary } = message;

				// Debug: Log all observed scene UUIDs
				console.log( 'DevTools: observedScenes:', observedScenes.map( s => s.uuid ) );

				try {

					let scene = null;

					// First try the normal approach - find in our observed scenes
					scene = observedScenes.find( s => s.uuid === sceneUuid );
					if ( ! scene ) {

						console.log( 'DevTools: Scene not found in observedScenes, trying alternative detection...' );

					}

					// Method 1: Look for active scenes in the global THREE namespace if available
					if ( ! scene && window.THREE && window.THREE.Scene ) {

						for ( const prop in window.THREE ) {

							if ( window.THREE[ prop ] && window.THREE[ prop ].isScene && window.THREE[ prop ].children && window.THREE[ prop ].children.length > 0 ) {

								console.log( 'DevTools: Found potential scene in THREE namespace:', prop, window.THREE[ prop ].uuid );
								scene = window.THREE[ prop ];
								break;

							}

						}

					}

					// Method 2: Look through the app's own rendering engine if available
					if ( ! scene ) {

						console.log( 'DevTools: Searching through rendering engine...' );
						const props = [ 'viewer', 'engine', 'renderer', 'scene', 'model' ];
						for ( const prop of props ) {

							if ( window[ prop ] && window[ prop ].scene ) {

								console.log( 'DevTools: Found scene through', prop + '.scene', window[ prop ].scene.uuid );
								scene = window[ prop ].scene;
								break;

							}

						}

					}

					// Method 3: Look for scenes stored in the global scope
					if ( ! scene ) {

						for ( const prop in window ) {

							try {

								if ( window[ prop ] && typeof window[ prop ] === 'object' && window[ prop ].isScene && window[ prop ].children && window[ prop ].children.length > 0 ) {

									console.log( 'DevTools: Found scene in global scope:', prop, window[ prop ].uuid );
									scene = window[ prop ];
									break;

								}

							} catch ( e ) {}

						}

					}

					// Method 4: Find the primary renderer and get its scene from there
					if ( ! scene && observedRenderers.length > 0 ) {

						for ( const renderer of observedRenderers ) {

							if ( renderer._currentScene ) {

								console.log( 'DevTools: Found scene through renderer._currentScene:', renderer._currentScene.uuid );
								scene = renderer._currentScene;
								break;

							} else if ( renderer.info && renderer.info._scene ) {

								console.log( 'DevTools: Found scene through renderer.info._scene:', renderer.info._scene.uuid );
								scene = renderer.info._scene;
								break;

							}

						}

					}

					// Method 5: If we found one scene originally, use that even if UUIDs don't match
					if ( ! scene && observedScenes.length === 1 ) {

						console.log( 'DevTools: Using the only observed scene:', observedScenes[ 0 ].uuid );
						scene = observedScenes[ 0 ];

					}

					// Method 6: Find the scene with the most objects (likely the main scene)
					if ( ! scene && observedScenes.length > 1 ) {

						let maxObjects = 0;
						for ( const obsScene of observedScenes ) {

							const objectCount = obsScene.children ? obsScene.children.length : 0;
							if ( objectCount > maxObjects ) {

								maxObjects = objectCount;
								scene = obsScene;

							}

						}

						if ( scene ) {

							console.log( 'DevTools: Using scene with most objects:', scene.uuid );

						}

					}

					if ( ! scene ) {

						console.error( 'DevTools: Scene not found for export:', sceneUuid, 'Available scenes:', observedScenes.map( s => s.uuid ) );
						// dispatchEvent( 'export-error', {
						// 	sceneUuid,
						// 	error: `Scene not found for export: ${sceneUuid}. Try refreshing the page and reopening DevTools.`
						// } );

						return;

					}

					// --- EXPORT STARTED ---
					dispatchEvent( 'export-started', { sceneUuid, binary } );

					// Load GLTFExporter and three.js using robust script injection/global fallback
					let exportRecoveryAttempts = 0;
					const MAX_EXPORT_RECOVERY_ATTEMPTS = 3;
					function loadExporter( callback ) {

						if ( ! EXPORTER_URL || ! THREE_URL ) {

							console.error( 'DevTools: exporter or three.js URL not set' );
							return;

						}

						// Guard against infinite recovery/re-injection loops
						if ( exportRecoveryAttempts > MAX_EXPORT_RECOVERY_ATTEMPTS ) {

							console.error( 'DevTools: Aborting export - too many recovery attempts' );
							dispatchEvent( 'export-error', {
								error: 'Too many exporter recovery attempts. Please reload the page.'
							} );
							return;

						}

						exportRecoveryAttempts ++;
						// Try global fallback first
						if ( window.GLTFExporterClass && window.THREE ) {

							callback( window.GLTFExporterClass, window.THREE );
							return;

						}

						// Try to find GLTFExporter and THREE in global scope
						if ( window.THREE && window.THREE.GLTFExporter ) {

							window.GLTFExporterClass = window.THREE.GLTFExporter;
							callback( window.THREE.GLTFExporter, window.THREE );
							return;

						}

						// Inject three.js if not present
						function injectScript( url, globalName, onLoad ) {

							if ( window[ globalName ] ) {

								onLoad();
								return;

							}

							const script = document.createElement( 'script' );
							script.src = url;
							script.async = false;
							script.onload = onLoad;
							script.onerror = function ( e ) {

								console.error( 'DevTools: Failed to inject script:', url, e );
								dispatchEvent( 'export-error', { error: 'Failed to inject script: ' + url } );

							};

							document.head.appendChild( script );

						}

						// Inject three.js first if needed
						injectScript( THREE_URL, 'THREE', () => {

							// Inject GLTFExporter if needed
							if ( window.GLTFExporterClass ) {

								callback( window.GLTFExporterClass, window.THREE );
								return;

							}

							// Try to find GLTFExporter in window.THREE
							if ( window.THREE && window.THREE.GLTFExporter ) {

								window.GLTFExporterClass = window.THREE.GLTFExporter;
								callback( window.THREE.GLTFExporter, window.THREE );
								return;

							}

							// Otherwise inject exporter script
							injectScript( EXPORTER_URL, 'GLTFExporterClass', () => {

								// Try to find GLTFExporter in window.THREE or global
								if ( window.THREE && window.THREE.GLTFExporter ) {

									window.GLTFExporterClass = window.THREE.GLTFExporter;
									callback( window.THREE.GLTFExporter, window.THREE );

								} else if ( window.GLTFExporter ) {

									window.GLTFExporterClass = window.GLTFExporter;
									callback( window.GLTFExporter, window.THREE );

								} else if ( window.GLTFExporterClass ) {

									callback( window.GLTFExporterClass, window.THREE );

								} else {

									console.error( 'DevTools: Failed to load GLTFExporter after injection' );
									dispatchEvent( 'export-error', { error: 'Failed to load GLTFExporter after injection' } );

								}

							} );

						} );

					}

					loadExporter( ( GLTFExporter ) => {

						try {

							console.log( 'DevTools: Starting export of scene', sceneUuid, 'as', binary ? 'GLB' : 'GLTF' );

							// Create a deep clone of the scene for export if needed
							let exportScene = scene;

							// Pre-process scene to ensure compatibility with other programs
							function prepareSceneForExport( originalScene ) {

								console.log( 'DevTools: Preparing scene for export...' );

								// Create a clone of the scene to avoid modifying the original
								const clonedScene = originalScene.clone();

								// Fix common issues that prevent successful export
								const problemMaterials = [];
								const problemGeometries = [];

								// Track processed objects to avoid infinite recursion
								const processedObjects = new Set();

								// Process all objects in the scene to fix common issues
								function processObject( object ) {

									if ( processedObjects.has( object.uuid ) ) {

										return;

									}

									processedObjects.add( object.uuid );

									// Fix Mesh issues
									if ( object.isMesh ) {

										// Fix missing normals (a common issue)
										if ( object.geometry && ! object.geometry.attributes.normal ) {

											try {

												object.geometry.computeVertexNormals();
												console.log( 'DevTools: Added missing normals to mesh:', object.name || object.uuid );

											} catch ( e ) {

												console.warn( 'DevTools: Could not compute normals for mesh:', object.name || object.uuid );
												problemGeometries.push( object.uuid );

											}

										}

										// Fix material issues
										if ( object.material ) {

											const materials = Array.isArray( object.material ) ? object.material : [ object.material ];

											materials.forEach( material => {

												// Check for broken texture references
												const textureProps = [
													'map', 'normalMap', 'roughnessMap', 'metalnessMap',
													'emissiveMap', 'bumpMap', 'displacementMap',
													'aoMap', 'envMap', 'lightMap'
												];

												for ( const prop of textureProps ) {

													if ( material[ prop ] && ( ! material[ prop ].image || material[ prop ].image.width === 0 ) ) {

														console.warn( `DevTools: Removing invalid ${prop} texture from material`, material.uuid );
														material[ prop ] = null;
														problemMaterials.push( material.uuid );

													}

												}

												// Fix NaN values in material properties
												const numberProps = [ 'roughness', 'metalness', 'opacity', 'emissiveIntensity' ];
												for ( const prop of numberProps ) {

													if ( material[ prop ] !== undefined && ( isNaN( material[ prop ] ) || ! isFinite( material[ prop ] ) ) ) {

														console.warn( `DevTools: Fixing invalid ${prop} value in material`, material.uuid );
														// Set reasonable defaults
														switch ( prop ) {

															case 'roughness': material[ prop ] = 0.5; break;
															case 'metalness': material[ prop ] = 0.0; break;
															case 'opacity': material[ prop ] = 1.0; break;
															case 'emissiveIntensity': material[ prop ] = 1.0; break;
															default: material[ prop ] = 0;

														}

														problemMaterials.push( material.uuid );

													}

												}

											} );

										}

									}

									// Process children
									if ( object.children ) {

										object.children.forEach( child => processObject( child ) );

									}

								}

								// Start processing from the scene root
								processObject( clonedScene );

								if ( problemMaterials.length > 0 || problemGeometries.length > 0 ) {

									console.warn( `DevTools: Fixed ${problemMaterials.length} material(s) and ${problemGeometries.length} geometry/geometries during scene preparation` );

								} else {

									console.log( 'DevTools: Scene preparation complete - no issues found' );

								}

								return clonedScene;

							}

							// Prepare the scene for export
							exportScene = prepareSceneForExport( scene );
							// Create TextureUtils if available - needed for proper texture handling
							let textureUtils = null;
							if ( window.THREE && window.THREE.WebGLRenderer ) {

								try {

									// Create a temporary renderer for texture processing
									const tempRenderer = new window.THREE.WebGLRenderer( { antialias: false } );
									tempRenderer.setSize( 1, 1 );
									tempRenderer.outputColorSpace = 'srgb';

									// If there's a TextureUtils module available in the page
									if ( window.TextureUtils ) {

										textureUtils = window.TextureUtils;

									} else if ( window.THREE.TextureUtils ) {

										textureUtils = window.THREE.TextureUtils;

									}

									if ( textureUtils ) {

										console.log( 'DevTools: Found TextureUtils for better texture export' );

									}

									// Clean up
									tempRenderer.dispose();

								} catch ( e ) {

									console.warn( 'DevTools: Could not create temporary renderer:', e );

								}

							}

							// Configure exporter with optimal settings
							const exporter = new GLTFExporter();
							if ( textureUtils ) {

								exporter.setTextureUtils( textureUtils );

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
							if ( typeof exporter.parseAsync === 'function' ) {

								// Modern approach with promises
								exporter.parseAsync( exportScene, exportOptions )
									.then( result => {

										createDownload( result );

									} )
									.catch( error => {

										console.error( 'DevTools: Error during async export:', error );
										dispatchEvent( 'export-error', {
											sceneUuid,
											error: error.toString()
										} );

									} );

							} else {

								// Older callback approach
								try {

									exporter.parse( exportScene,
										function ( result ) {

											createDownload( result );

										},
										function ( error ) {

											console.error( 'DevTools: Error during export:', error );
											dispatchEvent( 'export-error', {
												sceneUuid,
												error: error.toString()
											} );

										},
										exportOptions
									);

								} catch ( parseError ) {

									console.error( 'DevTools: Exception during export setup:', parseError );
									dispatchEvent( 'export-error', {
										sceneUuid,
										error: parseError.toString()
									} );

								}

							}

							// Function to handle the download process
							function createDownload( result ) {

								// --- FILE GENERATED ---
								dispatchEvent( 'export-file-generated', { sceneUuid, binary } );

								// Generate a unique filename with timestamp
								const timestamp = new Date().toISOString().replace( /[:.]/g, '-' ).substring( 0, 19 );
								const filename = binary ? `scene-${timestamp}.glb` : `scene-${timestamp}.gltf`;

								try {

									// Create a simple validation function for the export
									function validateExport( result, binary ) {

										return new Promise( ( resolve ) => {

											console.log( 'DevTools: Validating export...' );
											// Simple validation logic
											let valid = true;
											const errors = [];

											// Very basic validation
											if ( binary ) {

												if ( ! ( result instanceof ArrayBuffer ) ) {

													valid = false;
													errors.push( 'Expected ArrayBuffer for binary export' );

												}

											} else {

												// For GLTF (JSON)
												if ( typeof result === 'object' ) {
													// Object format is fine
												} else if ( typeof result === 'string' ) {

													try {

														JSON.parse( result ); // Just to validate

													} catch ( e ) {

														valid = false;
														errors.push( 'Invalid JSON in GLTF export' );

													}

												} else {

													valid = false;
													errors.push( 'Unexpected data type for GLTF export' );

												}

											}

											resolve( { valid, errors } );

										} );

									}

									// Validate the exported file before attempting to download
									validateExport( result, binary ).then( validationResult => {

										if ( ! validationResult.valid ) {

											console.error( 'DevTools: GLTF/GLB validation failed:', validationResult.errors );
											dispatchEvent( 'export-error', {
												sceneUuid,
												error: `Validation failed: ${validationResult.errors.join( ', ' )}`
											} );
											return;

										}

										console.log( 'DevTools: GLTF/GLB validation passed!' );

										// Check if we're dealing with binary data
										if ( binary ) {

											if ( ! ( result instanceof ArrayBuffer ) ) {

												console.error( 'DevTools: Expected ArrayBuffer for binary export but got:', typeof result );
												return;

											}

											// For GLB (binary), ensure we're handling the ArrayBuffer correctly
											const blob = new Blob( [ result ], { type: 'model/gltf-binary' } );
											downloadWithBlob( blob, filename );

										} else {

											// For GLTF (JSON), ensure proper formatting
											let jsonData;
											if ( typeof result === 'string' ) {

												// Already a string, validate it's proper JSON
												try {

													JSON.parse( result ); // Just validate, don't actually use the parsed result
													jsonData = result;

												} catch ( e ) {

													console.error( 'DevTools: Invalid JSON in GLTF export:', e );
													return;

												}

											} else if ( typeof result === 'object' ) {

												// Convert object to formatted JSON string
												try {

													jsonData = JSON.stringify( result, null, 2 );

												} catch ( e ) {

													console.error( 'DevTools: Failed to stringify GLTF object:', e );
													return;

												}

											} else {

												console.error( 'DevTools: Unexpected GLTF data type:', typeof result );
												return;

											}

											const blob = new Blob( [ jsonData ], { type: 'application/json' } );
											downloadWithBlob( blob, filename );

										}

									} ).catch( validationError => {

										console.error( 'DevTools: Error during validation:', validationError );
										dispatchEvent( 'export-error', {
											sceneUuid,
											error: `Validation error: ${validationError.message}`
										} );

									} );

								} catch ( error ) {

									console.error( 'DevTools: Error during file creation/download:', error );
									dispatchEvent( 'export-error', {
										sceneUuid,
										error: `Download error: ${error.message}`
									} );

								}

								function downloadWithBlob( blob, filename ) {

									try {

										// For GLB files, ensure we're using the correct MIME type
										if ( filename.endsWith( '.glb' ) ) {

											// Create a new blob with the correct MIME type
											// Some viewers are strict about the MIME type
											blob = new Blob( [ blob ], {
												type: 'model/gltf-binary' // Standardized MIME type for GLB
											} );

										} else if ( filename.endsWith( '.gltf' ) ) {

											// For GLTF JSON files, ensure we're using the correct MIME type
											blob = new Blob( [ blob ], {
												type: 'model/gltf+json' // Standardized MIME type for GLTF
											} );

										}

										// Add a small delay before creating the download
										// to ensure the blob is fully ready
										setTimeout( () => {

											const a = document.createElement( 'a' );
											const url = URL.createObjectURL( blob );
											a.href = url;
											a.download = filename;
											a.style.display = 'none';
											document.body.appendChild( a );
											const sizeMB = ( blob.size / ( 1024 * 1024 ) ).toFixed( 2 );
											console.log( `DevTools: Created blob for download: ${filename}, type: ${blob.type}, size: ${sizeMB} MB` );

											dispatchEvent( 'export-download-initiated', { sceneUuid, binary } );

											try {

												a.click();

												setTimeout( () => {

													try {

														document.body.removeChild( a );
														URL.revokeObjectURL( url );
														console.log( `DevTools: Download cleanup complete for ${filename}` );

													} catch ( cleanupError ) {

														console.warn( 'DevTools: Error during cleanup:', cleanupError );

													}

												}, 2000 );

												// --- EXPORT COMPLETE ---
												dispatchEvent( 'export-complete', {
													sceneUuid,
													binary,
													size: blob.size
												} );
												window.postMessage( {
													id: 'three-devtools',
													name: 'export-result',
													detail: {
														sceneUuid,
														binary,
														success: true
													}
												}, '*' );

											} catch ( clickError ) {

												console.error( 'DevTools: Error triggering download:', clickError );

												let altDownloadFailed = false;
												let altDownloadError = null;

												try {

													window.postMessage( {
														id: 'three-devtools',
														type: 'request-background-download',
														detail: {
															sceneUuid,
															binary,
															filename,
															dataUrl: url,
															blob: blob
														}
													}, '*' );

												} catch ( altError ) {

													altDownloadFailed = true;
													altDownloadError = altError;
													console.error( 'DevTools: Alternative download method failed:', altError );

												}

												if ( altDownloadFailed ) {

													dispatchEvent( 'export-error', {
														sceneUuid,
														error: `Download failed: ${clickError.message}; Alternative failed: ${altDownloadError && altDownloadError.message}`
													} );

												}

											}

										}, 200 );

									} catch ( downloadError ) {

										console.error( 'DevTools: Error setting up download:', downloadError );

										// Only send export-error if the download truly fails
										dispatchEvent( 'export-error', {
											sceneUuid,
											error: `Download setup failed: ${downloadError.message}`
										} );

									}

								}

							}

						} catch ( outerError ) {

							console.error( 'DevTools: Critical error during export process:', outerError );
							dispatchEvent( 'export-error', {
								sceneUuid,
								error: `Critical export error: ${outerError.message}`
							} );

						}

					} );

				} catch ( outerError ) {

					console.error( 'DevTools: Critical error during export process:', outerError );
					dispatchEvent( 'export-error', {
						sceneUuid,
						error: `Critical export error: ${outerError.message}`
					} );

				}

			}

		} );

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

		function dispatchEvent( name, detail ) {

			// More selective logging to prevent large object dumps in the console
			if ( name === 'export-result-meta' ) {

				console.log( 'DevTools Bridge: dispatchEvent', name, {
					sceneUuid: detail.sceneUuid,
					binary: detail.binary,
					size: ( detail.size / ( 1024 * 1024 ) ).toFixed( 2 ) + ' MB'
				} );

			} else if ( name === 'export-result' ) {

				console.log( 'DevTools Bridge: dispatchEvent', name, {
					sceneUuid: detail.sceneUuid,
					binary: detail.binary,
					size: detail.result instanceof ArrayBuffer
						? ( detail.result.byteLength / ( 1024 * 1024 ) ).toFixed( 2 ) + ' MB'
						: ( detail.result.length / ( 1024 * 1024 ) ).toFixed( 2 ) + ' MB'
				} );

			} else if ( name === 'scene' ) {

				console.log( 'DevTools Bridge: dispatchEvent', name, {
					sceneUuid: detail.sceneUuid,
					objectCount: ( detail.objects && detail.objects.length ) ? detail.objects.length : 0
				} );

			} else if ( name === 'renderer' ) {
				// console.log('DevTools Bridge: dispatchEvent', name, {
				// 	uuid: detail.uuid,
				// 	name: detail.type
				// });
			} else {

				 console.log( 'DevTools Bridge: dispatchEvent', name );

			}

			try {

				window.postMessage( {
					id: 'three-devtools',
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

		//console.log('Three.js DevTools: bridge.js loaded in page context');

	}

} )();
