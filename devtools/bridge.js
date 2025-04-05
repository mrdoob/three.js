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
            
            // console.log('DevTools: Creating ThreeDevToolsTarget');
        }

        addEventListener(type, listener, options) {
            // console.log('DevTools: Adding listener for:', type);
            super.addEventListener(type, listener, options);

            // If this is the first listener for a type, and we have backlogged events,
            // check if we should process them
            if (type !== 'devtools-ready' && this._backlog.length > 0) {
                this.dispatchEvent(new CustomEvent('devtools-ready'));
            }
        }

        dispatchEvent(event) {
            console.log('DevTools: Dispatching event:', event.type);
            if (this._ready || event.type === 'devtools-ready') {
                if (event.type === 'devtools-ready') {
                    this._ready = true;
                    console.log('DevTools: Processing backlog:', this._backlog.length, 'events');
                    const backlog = this._backlog;
                    this._backlog = [];
                    backlog.forEach(e => super.dispatchEvent(e));
                }
                return super.dispatchEvent(event);
            } else {
                console.log('DevTools: Backlogging event:', event.type);
                this._backlog.push(event);
                return false; // Return false to indicate synchronous handling
            }
        }

        reset() {
            console.log('DevTools: Resetting state');
            
            // Clear all monitoring intervals
            this.objects.forEach((obj, uuid) => {
                if (obj.isRenderer || obj.isScene) {
                    const interval = monitoringIntervals.get(obj);
                    if (interval) {
                        clearInterval(interval);
                        monitoringIntervals.delete(obj);
                    }
                }
            });
            
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

    // Store monitoring intervals without polluting objects
    const monitoringIntervals = new WeakMap();

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
                // Add renderer-specific properties
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
                    // Get current info values
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
            let descriptiveName;
            if (obj.isMesh) {
                const geoType = obj.geometry ? obj.geometry.type : 'Unknown';
                const matType = obj.material ? 
                    (Array.isArray(obj.material) ? 
                        obj.material.map(m => m.type).join(', ') : 
                        obj.material.type) : 
                    'Unknown';
                descriptiveName = `${obj.type || 'Mesh'} <span class="object-details">${geoType} ${matType}</span>`;
            } else if (obj.isLight) {
                descriptiveName = `${obj.type || 'Light'}`;
            } else if (obj.isCamera) {
                descriptiveName = `${obj.type || 'Camera'}`;
            } else {
                descriptiveName = obj.type || obj.constructor.name;
            }

            const data = {
                uuid: obj.uuid,
                type: obj.type || obj.constructor.name,
                name: descriptiveName,
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
            
            // console.log('DevTools: Object data:', data);
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
        console.log('DevTools: Three.js registered with revision:', event.detail.revision);
        dispatchEvent('register', event.detail);
    });

    // Listen for object observations
    devTools.addEventListener('observe', (event) => {
        const obj = event.detail;
        if (!obj) {
            console.warn('DevTools: Received observe event with null/undefined detail');
            return;
        }
        
        console.log('DevTools: Received object:', {
            type: obj.type || obj.constructor.name,
            isWebGLRenderer: obj.isWebGLRenderer === true,
            hasUUID: !!obj.uuid
        });
        
        // Generate UUID if needed (especially for WebGLRenderer)
        if (!obj.uuid) {
            obj.uuid = generateUUID();
            console.log('DevTools: Generated UUID for object:', obj.uuid);
        }
        
        // Skip if already registered
        if (devTools.objects.has(obj.uuid)) {
            console.log('DevTools: Object already registered:', obj.uuid);
            return;
        }
        
        console.log('DevTools: Found Three.js object:', obj.type || obj.constructor.name);
        
        // Get data for this object
        const data = getObjectData(obj);
        if (data) {
            console.log('DevTools: Got object data:', data);
            
            // If this is a renderer, start periodic updates
            if (obj.isWebGLRenderer) {
                console.log('DevTools: Starting periodic updates for renderer:', obj.uuid);
                data.properties = getRendererProperties(obj);
                observedRenderers.push(obj);
                startRendererMonitoring(obj);
            }
            
            // Store the object data
            devTools.objects.set(obj.uuid, data);
            dispatchEvent('observe', data);
            
            // If this is a scene, store the reference and traverse its children
            if (obj.isScene) {
                console.log('DevTools: Traversing scene children');
                
                // Store the scene reference locally
                observedScenes.push(obj);
                
                // First observe all existing children
                const processedObjects = new Set([obj.uuid]);
                
                function observeObject(object) {
                    if (!processedObjects.has(object.uuid)) {
                        processedObjects.add(object.uuid);
                        const objectData = getObjectData(object);
                        if (objectData) {
                            devTools.objects.set(object.uuid, objectData);
                            dispatchEvent('observe', objectData);
                        }
                        // Process children
                        object.children.forEach(child => observeObject(child));
                    }
                }
                
                // Process all children
                obj.children.forEach(child => observeObject(child));
                
                // Start monitoring for changes
                startSceneMonitoring(obj);
            }
        }
    });

    // Function to get renderer properties
    function getRendererProperties(renderer) {
        const webglInfo = getWebGLInfo(renderer);
        return {
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
        };
    }

    // Function to start renderer monitoring
    function startRendererMonitoring(renderer) {
        // Clear any existing monitoring
        const existingInterval = monitoringIntervals.get(renderer);
        if (existingInterval) {
            clearInterval(existingInterval);
        }

        // Function to monitor renderer properties
        function monitorRendererProperties() {
            try {
                // Skip updates if devtools is not visible
                if ( ! devTools.isVisible ) {
                    return;
                }

                const data = devTools.objects.get( renderer.uuid );
                if ( ! data ) {
                    clearInterval( intervalId );
                    monitoringIntervals.delete( renderer );
                    return;
                }

                const newProperties = getRendererProperties( renderer );
                if ( JSON.stringify( data.properties ) !== JSON.stringify( newProperties ) ) {
                    data.properties = newProperties;
                    dispatchEvent( 'update', data );
                }

            } catch ( error ) {

                // If we get an "Extension context invalidated" error, stop monitoring
                if ( error.message.includes( 'Extension context invalidated' ) ) {
                    clearInterval( intervalId );
                    monitoringIntervals.delete( renderer );
                    devTools.reset();
                    return;
                }

                console.warn( 'DevTools: Error in renderer monitoring:', error );

            }
        }

        const intervalId = setInterval(monitorRendererProperties, 1000);
        monitoringIntervals.set(renderer, intervalId);
    }

    // Start periodic renderer checks
    console.log('DevTools: Starting periodic renderer checks');

    // Function to check if bridge is available
    function checkBridgeAvailability() {
        const hasDevTools = window.hasOwnProperty('__THREE_DEVTOOLS__');
        const devToolsValue = window.__THREE_DEVTOOLS__;

        // If we have devtools and we're interactive or complete, trigger ready
        if (hasDevTools && devToolsValue && (document.readyState === 'interactive' || document.readyState === 'complete')) {
            devTools.dispatchEvent(new CustomEvent('devtools-ready'));
        }
    }

    // Function to update renderer properties
    function updateRendererProperties(renderer) {
        const storedData = devTools.objects.get(renderer.uuid);
        if (!storedData || !storedData.isRenderer) return;

        const webglInfo = getWebGLInfo(renderer);
        
        // Get current info values directly from the renderer
        const currentInfo = {
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
        };

        const newProperties = {
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
            info: currentInfo
        };

        // Always update since info values change frequently
        storedData.properties = newProperties;
        dispatchEvent('update', {
            uuid: renderer.uuid,
            type: 'WebGLRenderer',
            properties: newProperties
        });
    }

    // Watch for readyState changes
    document.addEventListener('readystatechange', () => {
        // console.log('DevTools: Document readyState changed to:', document.readyState);
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
            // Find the scene in our objects
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

    // Function to process scene data
    function processSceneData(sceneData) {
                    // Process all objects from the JSON data
                    if (sceneData.geometries) {
                        Object.values(sceneData.geometries).forEach(geo => {
                            if (geo.uuid && !devTools.objects.has(geo.uuid)) {
                                devTools.objects.set(geo.uuid, {
                                    uuid: geo.uuid,
                                    type: geo.type,
                                    name: '',
                                    visible: true,
                                    isGeometry: true,
                                    parent: null,
                                    children: []
                                });
                                dispatchEvent('observe', devTools.objects.get(geo.uuid));
                            }
                        });
                    }
                    
                    if (sceneData.materials) {
                        Object.values(sceneData.materials).forEach(mat => {
                            if (mat.uuid && !devTools.objects.has(mat.uuid)) {
                                devTools.objects.set(mat.uuid, {
                                    uuid: mat.uuid,
                                    type: mat.type,
                                    name: '',
                                    visible: true,
                                    isMaterial: true,
                                    parent: null,
                                    children: []
                                });
                                dispatchEvent('observe', devTools.objects.get(mat.uuid));
                            }
                        });
                    }
                    
                    if (sceneData.textures) {
                        Object.values(sceneData.textures).forEach(tex => {
                            if (tex.uuid && !devTools.objects.has(tex.uuid)) {
                                devTools.objects.set(tex.uuid, {
                                    uuid: tex.uuid,
                                    type: 'Texture',
                                    name: '',
                                    visible: true,
                                    isTexture: true,
                                    parent: null,
                                    children: []
                                });
                                dispatchEvent('observe', devTools.objects.get(tex.uuid));
                            }
                        });
                    }
                    
                    // Process object hierarchy
                    function processObject(obj) {
                        if (!obj || !obj.uuid) return;
                        
                        const data = {
                            uuid: obj.uuid,
                            type: obj.type,
                            name: obj.name || '',
                            visible: obj.visible !== undefined ? obj.visible : true,
                            isScene: obj.type === 'Scene',
                            isObject3D: true,
                            isCamera: obj.type.includes('Camera'),
                            isLight: obj.type.includes('Light'),
                            isMesh: obj.type === 'Mesh' || obj.type === 'SkinnedMesh',
                            parent: obj.parent,
                            children: obj.children || [],
                            matrix: obj.matrix,
                            material: obj.material,
                            geometry: obj.geometry
                        };
                        
                        if (!devTools.objects.has(obj.uuid)) {
                            devTools.objects.set(obj.uuid, data);
                            dispatchEvent('observe', data);
                        }
                        
            if (obj.children) {
                obj.children.forEach(processObject);
            }
        }
        
        processObject(sceneData.object);
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
        if (observedScenes && observedScenes.length > 0) {
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

    // Function to start scene monitoring
    function startSceneMonitoring(scene) {
        // Clear any existing monitoring
        const existingInterval = monitoringIntervals.get(scene);
        if (existingInterval) {
            clearInterval(existingInterval);
        }

        // Set up monitoring interval
        const intervalId = setInterval(() => {
            try {
                // Clear existing objects except renderers and the scene itself
                devTools.objects.forEach((obj, uuid) => {
                    if (!obj.isRenderer && uuid !== scene.uuid) {
                        devTools.objects.delete(uuid);
                        dispatchEvent('remove', { uuid });
                    }
                });
                
                // Traverse and recreate the entire object list
                function traverseScene(object) {
                    const objectData = getObjectData(object);
                    if (objectData) {
                        devTools.objects.set(object.uuid, objectData);
                        dispatchEvent('observe', objectData);
                        
                        // Traverse children
                        object.children.forEach(child => traverseScene(child));
                    }
                }
                
                // Start traversal from scene root
                traverseScene(scene);
            } catch (error) {
                // If we get an "Extension context invalidated" error, stop monitoring
                if (error.message.includes('Extension context invalidated')) {
                    clearInterval(intervalId);
                    monitoringIntervals.delete(scene);
                    devTools.reset();
                    return;
                }
                console.warn('DevTools: Error in scene monitoring:', error);
            }
        }, 1000);

        monitoringIntervals.set(scene, intervalId);

        // Clean up monitoring when scene is disposed
        const originalDispose = scene.dispose;
        scene.dispose = function() {
            const intervalId = monitoringIntervals.get(this);
            if (intervalId) {
                clearInterval(intervalId);
                monitoringIntervals.delete(this);
            }
            
            if (originalDispose) {
                originalDispose.call(this);
            }
        };
    }

    // Function to manually reload scene objects
    function reloadSceneObjects(scene) {
        console.log('DevTools: Manually reloading scene objects for scene:', scene.uuid);
        
        // Get a set of existing object IDs
        const existingObjects = new Set(devTools.objects.keys());
        
        // Track new objects to avoid duplicates
        const processedObjects = new Set();
        
        // Recursively observe all objects
        function observeObject(object) {
            if (!processedObjects.has(object.uuid)) {
                processedObjects.add(object.uuid);
                
                console.log('DevTools: Processing object during reload:', object.type || object.constructor.name, object.uuid);
                
                // Get object data
                const objectData = getObjectData(object);
                if (objectData) {
                    if (devTools.objects.has(object.uuid)) {
                        // Update existing object
                        const existingData = devTools.objects.get(object.uuid);
                        existingData.children = objectData.children;
                        dispatchEvent('update', existingData);
                    } else {
                        // Add new object
                        devTools.objects.set(object.uuid, objectData);
                        dispatchEvent('observe', objectData);
                        console.log('DevTools: New object observed during reload:', object.type || object.constructor.name);
                    }
                }
                
                // Process children recursively
                if (object.children && object.children.length > 0) {
                    console.log('DevTools: Processing', object.children.length, 'children of', object.type || object.constructor.name);
                    object.children.forEach(child => observeObject(child));
                }
            }
        }
        
        // Start with the scene itself to ensure everything is traversed
        observeObject(scene);
        
        console.log('DevTools: Scene reload complete. Processed', processedObjects.size, 'objects');
    }

    // Function to get simplified scene data
    function getSimpleSceneData(scene) {
        function getBasicObjectData(obj) {
            const data = {
                uuid: obj.uuid,
                type: obj.type || obj.constructor.name,
                name: obj.name || '',
                visible: obj.visible !== undefined ? obj.visible : true,
                position: obj.position ? { x: obj.position.x, y: obj.position.y, z: obj.position.z } : null,
                children: []
            };

            // Add material info if present
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    data.materials = obj.material.map(mat => ({
                        uuid: mat.uuid,
                        type: mat.type,
                        name: mat.name || ''
                    }));
                } else {
                    data.material = {
                        uuid: obj.material.uuid,
                        type: obj.material.type,
                        name: obj.material.name || ''
                    };
                }
            }

            // Add geometry info if present
            if (obj.geometry) {
                data.geometry = {
                    uuid: obj.geometry.uuid,
                    type: obj.geometry.type,
                    name: obj.geometry.name || ''
                };
            }

            // Add specific properties based on object type
            if (obj.isLight) {
                data.intensity = obj.intensity;
                data.color = obj.color ? obj.color.getHex() : null;
            } else if (obj.isCamera) {
                data.fov = obj.fov;
                data.near = obj.near;
                data.far = obj.far;
            }

            return data;
        }

        function traverseScene(obj) {
            const data = getBasicObjectData(obj);
            
            if (obj.children && obj.children.length > 0) {
                data.children = obj.children.map(child => traverseScene(child));
            }
            
            return data;
        }

        return {
            object: traverseScene(scene)
        };
    }
} else {
    console.log('DevTools: Bridge already initialized');
} 