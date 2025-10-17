import init from './scene.js';

var APP = {

	Player: function () {

		var renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setPixelRatio(window.devicePixelRatio); // TODO: Use player.setPixelRatio()

		var loader = new THREE.ObjectLoader();
		var camera, scene;

		var events = {};

		var dom = document.createElement('div');
		dom.appendChild(renderer.domElement);

		this.dom = dom;
		this.canvas = renderer.domElement;

		this.width = 500;
		this.height = 500;

		this.load = function (json) {

			var project = json.project;

			if (project.shadows !== undefined) renderer.shadowMap.enabled = project.shadows;
			if (project.shadowType !== undefined) renderer.shadowMap.type = project.shadowType;
			if (project.toneMapping !== undefined) renderer.toneMapping = project.toneMapping;
			if (project.toneMappingExposure !== undefined) renderer.toneMappingExposure = project.toneMappingExposure;

			this.setScene(loader.parse(json.scene));
			this.setCamera(loader.parse(json.camera));

			// Get controls from query string parameter, default to OrbitControls
			var urlParams = new URLSearchParams(window.location.search);
			var controlsType = urlParams.get('controls') || 'orbit';

			console.debug('Scene:', controlsType);
			
			// Map of available controls
			var controlsMap = {
				'orbit': window.OrbitControls,
				'map': window.MapControls,
				'trackball': window.TrackballControls,
				'fly': window.FlyControls,
				'firstperson': window.FirstPersonControls,
				'pointerlock': window.PointerLockControls,
				'transform': window.TransformControls,
				'drag': window.DragControls,
				'arcball': window.ArcballControls
			};
			
			// Initialize the selected controls
			var ControlsClass = controlsMap[controlsType.toLowerCase()];
			if (ControlsClass !== undefined) {
				// Special handling for DragControls which requires objects array
				if (controlsType.toLowerCase() === 'drag') {
					// Filter out non-draggable objects (Ground, lights, cameras, etc.)
					var draggableObjects = scene.children.filter(function(child) {
						// Exclude ground plane
						if (child.name === 'Ground') return false;
						// Exclude lights
						if (child.isLight) return false;
						// Exclude cameras
						if (child.isCamera) return false;
						// Exclude helpers
						if (child.type && (child.type.includes('Helper') || child.type.includes('Light'))) return false;
						// Include Target objects and other meshes/groups
						return true;
					});
					
					window.controls = new ControlsClass(draggableObjects, camera, renderer.domElement);
					console.debug('DragControls initialized with', draggableObjects.length, 'draggable objects:', draggableObjects.map(function(obj) { return obj.name || obj.type; }));
				} else {
					window.controls = new ControlsClass(camera, renderer.domElement);
				}
				
				// Setup camera target if controls support it
				if (window.controls && window.controls.target) {
					// Check for custom target name in query string
					var targetName = urlParams.get('target') || 'Target';
					
					// Function to find and target an object
					function findAndTargetObject() {
						var targetObject = null;
						
						// Search for the target object in the scene
						scene.traverse(function(child) {
							if (child.name === targetName) {
								targetObject = child;
							}
						});
						
						// If custom target wasn't found and we're not looking for default, try "Target"
						if (!targetObject && urlParams.get('target') !== null) {
							scene.traverse(function(child) {
								if (child.name === 'Target') {
									targetObject = child;
								}
							});
						}
						
						// Set the target if found
						if (targetObject) {
							// Calculate the bounding box of the target object
							var box = new THREE.Box3().setFromObject(targetObject);
							
							// Get the center of the bounding box (true center of the object)
							var center = new THREE.Vector3();
							box.getCenter(center);
							
							// Set controls target to the center of the object
							window.controls.target.copy(center);
							
							// Make camera look at the center
							camera.lookAt(center);
							camera.updateProjectionMatrix();
							
							// Save the state so the target persists
							if (window.controls.saveState) {
								window.controls.saveState();
							}
							
							console.debug('Camera target set to object:', targetObject.name, 'at center:', center);
							return true; // Found and targeted
						}
						
						return false; // Not found yet
					}
					
					// Try to find target immediately
					var found = findAndTargetObject();
					
					// If not found, retry periodically (GLB may still be loading)
					if (!found) {
						var retryCount = 0;
						var maxRetries = 50; // Try for up to 5 seconds
						var retryInterval = setInterval(function() {
							retryCount++;
							var success = findAndTargetObject();
							
							if (success) {
								clearInterval(retryInterval);
								console.debug('Target object found after', retryCount, 'retries');
							} else if (retryCount >= maxRetries) {
								clearInterval(retryInterval);
								console.warn('Target object "' + targetName + '" not found in scene after waiting. Camera will use default target.');
							}
						}, 100); // Check every 100ms
					}
				}
			}
			
			// Define drag constraints setup function globally so it can be reused when switching controls
			window.setupDragConstraints = function() {
				if (!window.controls || window.controls.constructor.name !== 'DragControls') {
					return;
				}
				
				var draggedObjectInitialY = {};
				
				// Remove any existing listeners first to avoid duplicates
				window.controls.removeEventListener('drag');
				window.controls.removeEventListener('dragend');
				
				// On drag: constrain Y-axis movement
				window.controls.addEventListener('drag', function(event) {
					var object = event.object;
					
					// Store initial Y position when drag starts
					if (draggedObjectInitialY[object.uuid] === undefined) {
						draggedObjectInitialY[object.uuid] = object.position.y;
					}
					
					// Lock Y position during drag (no vertical movement)
					object.position.y = draggedObjectInitialY[object.uuid];
				});
				
				// On dragend: animate fall to ground
				window.controls.addEventListener('dragend', function(event) {
					var object = event.object;
					
					// Find ground plane Y position
					var groundY = 0;
					var ground = scene.getObjectByName('Ground');
					if (ground) {
						groundY = ground.position.y;
					}
					
					// Calculate where object should rest (accounting for bounding box)
					var box = new THREE.Box3().setFromObject(object);
					var objectBottomY = box.min.y;
					var objectHeight = box.max.y - box.min.y;
					
					// Target Y is ground level plus offset to make bottom touch ground
					var currentBottomOffset = object.position.y - objectBottomY;
					var targetY = groundY + currentBottomOffset;
					
					// Animate falling to ground
					var startY = object.position.y;
					var startTime = performance.now();
					var duration = 500; // 500ms animation
					
					function animateFall() {
						var elapsed = performance.now() - startTime;
						var progress = Math.min(elapsed / duration, 1);
						
						// Easing function (ease-out cubic for natural fall)
						var eased = 1 - Math.pow(1 - progress, 3);
						
						object.position.y = startY + (targetY - startY) * eased;
						
						if (progress < 1) {
							requestAnimationFrame(animateFall);
						} else {
							// Clean up stored initial Y
							delete draggedObjectInitialY[object.uuid];
						}
					}
					
					animateFall();
				});
				
				console.debug('Drag constraints enabled: objects locked to ground plane');
			};
			
			// Apply drag constraints if using DragControls initially
			if (controlsType.toLowerCase() === 'drag' && window.controls) {
				window.setupDragConstraints();
			}
			
			events = {
				init: [],
				start: [],
				stop: [],
				keydown: [],
				keyup: [],
				pointerdown: [],
				pointerup: [],
				pointermove: [],
				update: []
			};

			var scriptWrapParams = 'player,renderer,scene,camera';
			var scriptWrapResultObj = {};

			for (var eventKey in events) {

				scriptWrapParams += ',' + eventKey;
				scriptWrapResultObj[eventKey] = eventKey;

			}

			var scriptWrapResult = JSON.stringify(scriptWrapResultObj).replace(/\"/g, '');

			for (var uuid in json.scripts) {

				var object = scene.getObjectByProperty('uuid', uuid, true);

				if (object === undefined) {

					console.warn('APP.Player: Script without object.', uuid);
					continue;

				}

				var scripts = json.scripts[uuid];

				for (var i = 0; i < scripts.length; i++) {

					var script = scripts[i];

					var functions = (new Function(scriptWrapParams, script.source + '\nreturn ' + scriptWrapResult + ';').bind(object))(this, renderer, scene, camera);

					for (var name in functions) {

						if (functions[name] === undefined) continue;

						if (events[name] === undefined) {

							console.warn('APP.Player: Event type not supported (', name, ')');
							continue;

						}

						events[name].push(functions[name].bind(object));

					}

				}

			}

			init(renderer, scene, camera);

			dispatch(events.init, arguments);

		};

		this.setCamera = function (value) {

			camera = value;
			camera.aspect = this.width / this.height;
			camera.updateProjectionMatrix();

		};

		this.setScene = function (value) {

			scene = value;

		};

		this.setPixelRatio = function (pixelRatio) {

			renderer.setPixelRatio(pixelRatio);

		};

		this.setSize = function (width, height) {

			this.width = width;
			this.height = height;

			if (camera) {

				camera.aspect = this.width / this.height;
				camera.updateProjectionMatrix();

			}

			renderer.setSize(width, height);

		};

		function dispatch(array, event) {

			for (var i = 0, l = array.length; i < l; i++) {

				array[i](event);

			}

		}

		var time, startTime, prevTime;

		function animate() {

			time = performance.now();

			try {

				dispatch(events.update, { time: time - startTime, delta: time - prevTime });

			} catch (e) {

				console.error((e.message || e), (e.stack || ''));

			}
			
			// Update controls if they exist
			if (window.controls && window.controls.update) {
				var controlsName = window.controls.constructor.name;
				if (controlsName === 'FlyControls' || controlsName === 'FirstPersonControls') {
					// These controls need delta time in seconds
					var delta = (time - prevTime) / 1000;
					window.controls.update(delta);
					
					// Lock Y position for FirstPersonControls (simulate walking on ground)
					if (controlsName === 'FirstPersonControls') {
						camera.position.y = 1;
					}
				} else {
					// Other controls don't need delta or use clock internally
					window.controls.update();
				}
			}

			renderer.render(scene, camera);

			prevTime = time;

		}

		this.play = function () {

			startTime = prevTime = performance.now();

			document.addEventListener('keydown', onKeyDown);
			document.addEventListener('keyup', onKeyUp);
			document.addEventListener('pointerdown', onPointerDown);
			document.addEventListener('pointerup', onPointerUp);
			document.addEventListener('pointermove', onPointerMove);
			document.addEventListener('dblclick', onDoubleClick);

			dispatch(events.start, arguments);

			renderer.setAnimationLoop(animate);

		};

		this.stop = function () {

			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('pointerup', onPointerUp);
			document.removeEventListener('pointermove', onPointerMove);
			document.removeEventListener('dblclick', onDoubleClick);

			dispatch(events.stop, arguments);

			renderer.setAnimationLoop(null);

		};

		this.render = function (time) {

			dispatch(events.update, { time: time * 1000, delta: 0 /* TODO */ });

			renderer.render(scene, camera);

		};

		this.dispose = function () {

			renderer.dispose();

			camera = undefined;
			scene = undefined;

		};

		//

		function onKeyDown(event) {

			dispatch(events.keydown, event);

		}

		function onKeyUp(event) {

			dispatch(events.keyup, event);

		}

		function onPointerDown(event) {

			dispatch(events.pointerdown, event);

		}

		function onPointerUp(event) {

			dispatch(events.pointerup, event);

		}

		function onPointerMove(event) {

			dispatch(events.pointermove, event);

		}
		
		function onDoubleClick(event) {
			
			// Raycaster for detecting clicked objects
			var raycaster = new THREE.Raycaster();
			var mouse = new THREE.Vector2();
			
			// Calculate mouse position in normalized device coordinates (-1 to +1)
			var rect = renderer.domElement.getBoundingClientRect();
			mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
			
			// Update raycaster with camera and mouse position
			raycaster.setFromCamera(mouse, camera);
			
			// Find intersected objects
			var intersects = raycaster.intersectObjects(scene.children, true);
			
			if (intersects.length > 0) {
				
				var clickedObject = intersects[0].object;
				
				// Find the top-level object (traverse up to root)
				var targetObject = clickedObject;
				while (targetObject.parent && targetObject.parent !== scene) {
					targetObject = targetObject.parent;
				}
				
				// Check if this is a Target object or has Target in its name
				if (targetObject.name && (targetObject.name === 'Target' || targetObject.name.includes('Target'))) {
					
					console.debug('Double-clicked on Target object:', targetObject.name);
					
					// Only update if controls support targeting
					if (window.controls && window.controls.target) {
						
						// Calculate the bounding box of the target object
						var box = new THREE.Box3().setFromObject(targetObject);
						
						// Get the center of the bounding box (true center of the object)
						var center = new THREE.Vector3();
						box.getCenter(center);
						
						// Smoothly transition the controls target to the center
						window.controls.target.copy(center);
						
						// Make camera look at the center
						camera.lookAt(center);
						camera.updateProjectionMatrix();
						
						// Save the state so the target persists
						if (window.controls.saveState) {
							window.controls.saveState();
						}
						
						// Update the settings form input if it exists
						var targetInput = document.querySelector('input[name="target"]');
						if (targetInput) {
							targetInput.value = targetObject.name;
							console.debug('Settings form updated with target:', targetObject.name);
						}
						
						console.debug('Camera target updated to:', targetObject.name, 'at center:', center);
						
					}
					
				}
				
			}
			
		}

	}

};

export { APP };
