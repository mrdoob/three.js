// Scene Configuration Script
// Reads query string parameters to configure rendering settings, camera, lighting, background, fog, etc.

const _debug = console.debug;
console.debug = function () {
    _debug('[DEBUG]', ...arguments);
};

let camera, scene, renderer, loadingManager;

// Ground material texture mapping
const groundMaterialTextures = {
    'BarkPoplar001': { color: 'BarkPoplar001_COL_2K.jpg', normal: 'BarkPoplar001_NRM_2K.jpg' },
    'BricksDragfacedRunning008': { color: 'BricksDragfacedRunning008_COL_2K.png', normal: 'BricksDragfacedRunning008_NRM_2K.png' },
    'GroundDirtRocky020': { color: 'GroundDirtRocky020_COL_2K.jpg', normal: 'GroundDirtRocky020_NRM_2K.jpg' },
    'GroundDirtWeedsPatchy004': { color: 'GroundDirtWeedsPatchy004_COL_2K.jpg', normal: 'GroundDirtWeedsPatchy004_NRM_2K.jpg' },
    'GroundSand005': { color: 'GroundSand005_COL_2K.jpg', normal: 'GroundSand005_NRM_2K.jpg' },
    'GroundWoodChips001': { color: 'GroundWoodChips001_COL_2K.jpg', normal: 'GroundWoodChips001_NRM_2K.jpg' },
    'MetalCorrodedHeavy001': { color: 'MetalCorrodedHeavy001_COL_2K_METALNESS.jpg', normal: 'MetalCorrodedHeavy001_NRM_2K_METALNESS.jpg' },
    'MetalGalvanizedSteelWorn001': { color: 'MetalGalvanizedSteelWorn001_COL_2K_METALNESS.jpg', normal: 'MetalGalvanizedSteelWorn001_NRM_2K_METALNESS.jpg' },
    'Poliigon_BrickReclaimedRunning_7787': { color: 'Poliigon_BrickReclaimedRunning_7787_BaseColor.jpg', normal: 'Poliigon_BrickReclaimedRunning_7787_Normal.png' },
    'Poliigon_BrickWallReclaimed_8320': { color: 'Poliigon_BrickWallReclaimed_8320_BaseColor.jpg', normal: 'Poliigon_BrickWallReclaimed_8320_Normal.png' },
    'Poliigon_ClayCeramicGlossy_5212': { color: 'Poliigon_ClayCeramicGlossy_5212_BaseColor.jpg', normal: 'Poliigon_ClayCeramicGlossy_5212_Normal.png' },
    'Poliigon_ConcreteFloorPoured_7656': { color: 'Poliigon_ConcreteFloorPoured_7656_BaseColor.jpg', normal: 'Poliigon_ConcreteFloorPoured_7656_Normal.png' },
    'Poliigon_ConcretePaversSquare_7100': { color: 'Poliigon_ConcretePaversSquare_7100_BaseColor.jpg', normal: 'Poliigon_ConcretePaversSquare_7100_Normal.png' },
    'Poliigon_GrassPatchyGround_4585': { color: 'Poliigon_GrassPatchyGround_4585_BaseColor.jpg', normal: 'Poliigon_GrassPatchyGround_4585_Normal.png' },
    'Poliigon_MetalBronzeWorn_7248': { color: 'Poliigon_MetalBronzeWorn_7248_BaseColor.jpg', normal: 'Poliigon_MetalBronzeWorn_7248_Normal.png' },
    'Poliigon_MetalPaintedMatte_7037': { color: 'Poliigon_MetalPaintedMatte_7037_BaseColor.jpg', normal: 'Poliigon_MetalPaintedMatte_7037_Normal.png' },
    'Poliigon_MetalRust_7642': { color: 'Poliigon_MetalRust_7642_BaseColor.jpg', normal: 'Poliigon_MetalRust_7642_Normal.png' },
    'Poliigon_MetalSteelBrushed_7174': { color: 'Poliigon_MetalSteelBrushed_7174_BaseColor.jpg', normal: 'Poliigon_MetalSteelBrushed_7174_Normal.png' },
    'Poliigon_PlasterPainted_7664': { color: 'Poliigon_PlasterPainted_7664_BaseColor.jpg', normal: 'Poliigon_PlasterPainted_7664_Normal.png' },
    'Poliigon_PlasticMoldWorn_7486': { color: 'Poliigon_PlasticMoldWorn_7486_BaseColor.jpg', normal: 'Poliigon_PlasticMoldWorn_7486_Normal.png' },
    'Poliigon_RattanWeave_6945': { color: 'Poliigon_RattanWeave_6945_BaseColor.jpg', normal: 'Poliigon_RattanWeave_6945_Normal.png' },
    'Poliigon_SlateFloorTile_7657': { color: 'Poliigon_SlateFloorTile_7657_BaseColor.jpg', normal: 'Poliigon_SlateFloorTile_7657_Normal.png' },
    'Poliigon_StoneQuartzite_8060': { color: 'Poliigon_StoneQuartzite_8060_BaseColor.jpg', normal: null },
    'Poliigon_TerrazzoTilePolished_4818': { color: 'Poliigon_TerrazzoTilePolished_4818_BaseColor.jpg', normal: 'Poliigon_TerrazzoTilePolished_4818_Normal.png' },
    'Poliigon_WoodRoofShingle_7834': { color: 'Poliigon_WoodRoofShingle_7834_BaseColor.jpg', normal: 'Poliigon_WoodRoofShingle_7834_Normal.png' },
    'Poliigon_WoodVeneerOak_7760': { color: 'Poliigon_WoodVeneerOak_7760_BaseColor.jpg', normal: 'Poliigon_WoodVeneerOak_7760_Normal.png' },
    'RammedEarth006': { color: 'RammedEarth006_COL_2K_METALNESS.png', normal: 'RammedEarth006_NRM_2K_METALNESS.png' },
    'RammedEarth018': { color: 'RammedEarth018_COL_2K_METALNESS.png', normal: 'RammedEarth018_NRM_2K_METALNESS.png' },
    'StoneBricksSplitface001': { color: 'StoneBricksSplitface001_COL_2K.jpg', normal: 'StoneBricksSplitface001_NRM_2K.jpg' },
    'TerrazzoSlab018': { color: 'TerrazzoSlab018_COL_2K_METALNESS.png', normal: 'TerrazzoSlab018_NRM_2K_METALNESS.png' },
    'TerrazzoSlab028': { color: 'TerrazzoSlab028_COL_2K_METALNESS.png', normal: 'TerrazzoSlab028_NRM_2K_METALNESS.png' },
    'TilesCeramicHerringbone002': { color: 'TilesCeramicHerringbone002_COL_2K.jpg', normal: 'TilesCeramicHerringbone002_NRM_2K.png' },
    'TilesMosaicPennyround001': { color: 'TilesMosaicPennyround001_COL_2K.png', normal: 'TilesMosaicPennyround001_NRM_2K.png' },
    'TilesMosaicYubi003': { color: 'TilesMosaicYubi003_COL_2K.png', normal: 'TilesMosaicYubi003_NRM_2K.png' },
    'TilesSquarePoolMixed001': { color: 'TilesSquarePoolMixed001_COL_2K.jpg', normal: 'TilesSquarePoolMixed001_NRM_2K.jpg' },
    'TilesTerracottaBeigeSquareStacked001': { color: 'TilesTerracottaBeigeSquareStacked001_COL_2K.jpg', normal: 'TilesTerracottaBeigeSquareStacked001_NRM_2K.jpg' },
    'TilesTravertine001': { color: 'TilesTravertine001_COL_2K.jpg', normal: 'TilesTravertine001_NRM_2K.jpg' }
};

export default function init(_renderer, _scene, _camera, _loadingManager) {

    renderer = _renderer;
    scene = _scene;
    camera = _camera;
    loadingManager = _loadingManager || new THREE.LoadingManager();

    const urlParams = new URLSearchParams(window.location.search);

    // Helper function to update DragControls with current scene objects
    // Make it globally accessible so it can be called when controls are switched
    window.updateDragControlsObjects = function() {
        if (window.controls && window.controls.constructor.name === 'DragControls') {
            // Filter out non-draggable objects
            const draggableObjects = scene.children.filter(function(child) {
                if (child.name === 'Ground') return false;
                if (child.isLight) return false;
                if (child.isCamera) return false;
                if (child.type && (child.type.includes('Helper') || child.type.includes('Light'))) return false;
                return true;
            });
            
            // Update the objects array in DragControls
            window.controls.objects.length = 0; // Clear existing
            draggableObjects.forEach(function(obj) {
                window.controls.objects.push(obj);
            });
            
            console.debug('DragControls updated with', draggableObjects.length, 'objects:', 
                draggableObjects.map(function(obj) { return obj.name || obj.type; }));
        }
    };

    // ============================================
    // ENABLE KEYBOARD INPUT FOR CONTROLS
    // ============================================

    // Make sure renderer domElement can receive keyboard focus
    // This is necessary for controls that use keyboard input (Fly, FirstPerson, etc.)
    if (renderer && renderer.domElement) {
        if (!renderer.domElement.hasAttribute('tabindex')) {
            renderer.domElement.setAttribute('tabindex', '0');
        }
        // Set outline to none to avoid focus ring
        renderer.domElement.style.outline = 'none';
        // Auto-focus so keyboard works immediately
        renderer.domElement.focus();
        console.debug('Renderer domElement configured for keyboard input');
    }

    // ============================================
    // RENDERER SETTINGS
    // ============================================

    // Tone mapping (toneMapping=none/linear/reinhard/cineon/acesfilmic)
    const toneMapping = urlParams.get('toneMapping');
    if (toneMapping) {
        const toneMappings = {
            'none': THREE.NoToneMapping,
            'linear': THREE.LinearToneMapping,
            'reinhard': THREE.ReinhardToneMapping,
            'cineon': THREE.CineonToneMapping,
            'acesfilmic': THREE.ACESFilmicToneMapping
        };
        if (toneMappings[toneMapping]) {
            renderer.toneMapping = toneMappings[toneMapping];
            console.debug('Tone mapping:', toneMapping);
        }
    }

    // Tone mapping exposure (toneMappingExposure=1.0)
    const toneMappingExposure = urlParams.get('toneMappingExposure');
    if (toneMappingExposure !== null) {
        renderer.toneMappingExposure = parseFloat(toneMappingExposure);
        console.debug('Tone mapping exposure:', renderer.toneMappingExposure);
    }

    // ============================================
    // CAMERA SETTINGS
    // ============================================

    // Camera field of view (cameraFov=50)
    const cameraFov = urlParams.get('cameraFov');
    if (cameraFov !== null && camera.fov !== undefined) {
        camera.fov = parseFloat(cameraFov);
        camera.updateProjectionMatrix();
        console.debug('Camera FOV:', camera.fov);
    }

    // Camera near/far planes (cameraNear=0.1&cameraFar=1000)
    const cameraNear = urlParams.get('cameraNear');
    const cameraFar = urlParams.get('cameraFar');
    if (cameraNear !== null || cameraFar !== null) {
        if (cameraNear !== null) camera.near = parseFloat(cameraNear);
        if (cameraFar !== null) camera.far = parseFloat(cameraFar);
        camera.updateProjectionMatrix();
        console.debug('Camera near/far:', camera.near, camera.far);
    }

    // NOTE: Camera position and rotation are now set AFTER controls initialization
    // (see waitForControls callback below) to prevent OrbitControls state conflicts

    // ============================================
    // BACKGROUND SETTINGS
    // ============================================

    // Background color (bgColor=0x000000 or bgColor=rgb(255,0,0) or bgColor=#ff0000)
    const bgColor = urlParams.get('bgColor');
    if (bgColor) {
        // Handle different color formats
        let color;
        if (bgColor.startsWith('0x')) {
            color = new THREE.Color(parseInt(bgColor, 16));
        } else if (bgColor.startsWith('#')) {
            color = new THREE.Color(bgColor);
        } else if (bgColor.startsWith('rgb')) {
            // Parse rgb(r,g,b) format
            const match = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                color = new THREE.Color(parseInt(match[1]) / 255, parseInt(match[2]) / 255, parseInt(match[3]) / 255);
            }
        } else {
            color = new THREE.Color(bgColor); // Try as color name
        }

        if (color) {
            scene.background = color;
            
            // Create a simple environment map from the background color
            // This provides uniform lighting from all directions
            const pmremGenerator = new THREE.PMREMGenerator(renderer);
            const envScene = new THREE.Scene();
            envScene.background = color;
            const envMap = pmremGenerator.fromScene(envScene).texture;
            scene.environment = envMap;
            pmremGenerator.dispose();
            
            console.debug('Background color set with environment lighting:', color);
        }
    }

    // Background texture/360 image (bgTexture=path/to/image.jpg)
    const bgTexture = urlParams.get('bgTexture');
    if (bgTexture) {
        const textureLoader = new THREE.TextureLoader(loadingManager);
        textureLoader.load(
            bgTexture,
            function (texture) {
                // Check if it's a 360/equirectangular image (bg360=true)
                const is360 = urlParams.get('bg360') === 'true';

                if (is360) {
                    // Set mapping for both background and environment
                    texture.mapping = THREE.EquirectangularReflectionMapping;
                    // texture.colorSpace = THREE.SRGBColorSpace;
                    
                    scene.background = texture;
                    scene.environment = texture;
                    
                    console.debug('360° background texture loaded and set as environment:', bgTexture);
                    
                    // Update all materials in the scene to use the environment map if they support it
                    scene.traverse(function(child) {
                        if (child.isMesh && child.material) {
                            const material = child.material;
                            
                            // Check if material supports environment mapping
                            if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                // For reflective materials, ensure envMapIntensity is set
                                if (material.envMapIntensity === undefined || material.envMapIntensity === 0) {
                                    material.envMapIntensity = 1.0;
                                }
                                
                                // If metalness is 0, increase it slightly for visible reflections
                                if (material.metalness !== undefined && material.metalness < 0.1) {
                                    console.debug('Increasing metalness for', child.name, 'to show environment reflections');
                                    material.metalness = 0.5;
                                }
                                
                                material.needsUpdate = true;
                            }
                        }
                    });
                } else {
                    scene.background = texture;
                    console.debug('Background texture loaded:', bgTexture);
                }
            },
            undefined,
            function (error) {
                console.error('Error loading background texture:', error);
            }
        );
    }

    // Background texture color space (bgColorSpace=srgb/linear)
    const bgColorSpace = urlParams.get('bgColorSpace');
    if (bgColorSpace && scene.background && scene.background.isTexture) {
        if (bgColorSpace === 'srgb') {
            scene.background.colorSpace = THREE.SRGBColorSpace;
        } else if (bgColorSpace === 'linear') {
            scene.background.colorSpace = THREE.LinearSRGBColorSpace;
        } else {
            scene.background.colorSpace = THREE.NoColorSpace;
        }
        console.debug('Background color space:', bgColorSpace);
    }

    // ============================================
    // FOG SETTINGS
    // ============================================

    // Fog type (fogType=linear/exp/exp2)
    const fogType = urlParams.get('fogType');
    if (fogType) {
        const fogColor = urlParams.get('fogColor') || '0xcccccc';
        let color;

        // Parse fog color
        if (fogColor.startsWith('0x')) {
            color = parseInt(fogColor, 16);
        } else if (fogColor.startsWith('#')) {
            color = new THREE.Color(fogColor);
        } else {
            color = new THREE.Color(fogColor);
        }

        if (fogType === 'linear') {
            // Linear fog (fogNear=1&fogFar=1000)
            const fogNear = parseFloat(urlParams.get('fogNear') || '1');
            const fogFar = parseFloat(urlParams.get('fogFar') || '1000');
            scene.fog = new THREE.Fog(color, fogNear, fogFar);
            console.debug('Linear fog:', color, 'near:', fogNear, 'far:', fogFar);
        } else if (fogType === 'exp' || fogType === 'exp2') {
            // Exponential fog (fogDensity=0.00025)
            const fogDensity = parseFloat(urlParams.get('fogDensity') || '0.00025');
            scene.fog = new THREE.FogExp2(color, fogDensity);
            console.debug('Exponential fog:', color, 'density:', fogDensity);
        }
    }

    // Remove fog (fogType=none)
    if (fogType === 'none') {
        scene.fog = null;
        console.debug('Fog disabled');
    }

    // ============================================
    // TARGET OBJECT (GLB MODEL) SETTINGS
    // ============================================
    // Note: This section is skipped in the editor since app.js handles target loading
    // with additional features like camera targeting. This is only used in published apps.
    
    // ============================================
    // TARGET OBJECT(S) LOADING
    // ============================================
    
    if (window.GLTFLoader) {
        const loader = new window.GLTFLoader();
        loader.setPath('');
        
        // Load multi-target objects (target_0_glb, target_1_glb, etc.)
        let targetIndex = 0;
        let foundTargets = false;
        
        while (true) {
            const targetGlbUrl = urlParams.get(`target_${targetIndex}_glb`);
            if (!targetGlbUrl) break;
            
            foundTargets = true;
            
            // Capture the index in a closure for the callback
            (function(index) {
                loader.load(targetGlbUrl, function (gltf) {
                    const targetObject = gltf.scene;
                    targetObject.name = `Target_${index}`;
                    
                    // Apply position
                    const posX = parseFloat(urlParams.get(`target_${index}_position_x`) || '0');
                    const posY = parseFloat(urlParams.get(`target_${index}_position_y`) || '0');
                    const posZ = parseFloat(urlParams.get(`target_${index}_position_z`) || '0');
                    targetObject.position.set(posX, posY, posZ);
                    
                    // Apply rotation (convert degrees to radians)
                    const rotX = parseFloat(urlParams.get(`target_${index}_rotation_x`) || '0') * Math.PI / 180;
                    const rotY = parseFloat(urlParams.get(`target_${index}_rotation_y`) || '0') * Math.PI / 180;
                    const rotZ = parseFloat(urlParams.get(`target_${index}_rotation_z`) || '0') * Math.PI / 180;
                    targetObject.rotation.set(rotX, rotY, rotZ);
                    
                    // Apply scale
                    const scaleX = parseFloat(urlParams.get(`target_${index}_scale_x`) || '1');
                    const scaleY = parseFloat(urlParams.get(`target_${index}_scale_y`) || '1');
                    const scaleZ = parseFloat(urlParams.get(`target_${index}_scale_z`) || '1');
                    targetObject.scale.set(scaleX, scaleY, scaleZ);
                    
                    // Enable shadows
                    targetObject.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    scene.add(targetObject);
                    console.debug(`Target_${index} GLB loaded:`, targetGlbUrl, targetObject);
                    
                    // Update DragControls if active
                    updateDragControlsObjects();
                }, undefined, function (error) {
                    console.error(`Error loading Target_${index} GLB:`, error);
                });
            })(targetIndex);
            
            targetIndex++;
        }
        
        // Fallback to legacy target_glb if no multi-targets found
        if (!foundTargets) {
            const legacyTargetUrl = urlParams.get('target_glb');
            if (legacyTargetUrl) {
                loader.load(legacyTargetUrl, function (gltf) {
                    const targetObject = gltf.scene;
                    targetObject.name = 'Target';
                    
                    // Apply position
                    const posX = parseFloat(urlParams.get('target_position_x') || '0');
                    const posY = parseFloat(urlParams.get('target_position_y') || '0');
                    const posZ = parseFloat(urlParams.get('target_position_z') || '0');
                    targetObject.position.set(posX, posY, posZ);
                    
                    // Apply rotation (convert degrees to radians)
                    const rotX = parseFloat(urlParams.get('target_rotation_x') || '0') * Math.PI / 180;
                    const rotY = parseFloat(urlParams.get('target_rotation_y') || '0') * Math.PI / 180;
                    const rotZ = parseFloat(urlParams.get('target_rotation_z') || '0') * Math.PI / 180;
                    targetObject.rotation.set(rotX, rotY, rotZ);
                    
                    // Apply scale
                    const scaleX = parseFloat(urlParams.get('target_scale_x') || '1');
                    const scaleY = parseFloat(urlParams.get('target_scale_y') || '1');
                    const scaleZ = parseFloat(urlParams.get('target_scale_z') || '1');
                    targetObject.scale.set(scaleX, scaleY, scaleZ);
                    
                    // Enable shadows
                    targetObject.traverse(function (child) {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });
                    
                    scene.add(targetObject);
                    console.debug('Target GLB loaded (legacy):', legacyTargetUrl, targetObject);
                    
                    // Update DragControls if active
                    updateDragControlsObjects();
                }, undefined, function (error) {
                    console.error('Error loading target GLB:', error);
                });
            }
        }
    } else {
        console.debug('GLTFLoader not available - target GLB(s) will not load.');
    }

    // ============================================
    // LIGHTING SETTINGS
    // ============================================

    // Ambient light
    const ambientEnabled = urlParams.get('ambient_enabled') !== 'false';
    if (ambientEnabled) {
        const ambientColor = urlParams.get('ambient_color') || '#ffffff';
        const ambientIntensity = parseFloat(urlParams.get('ambient_intensity') || '0.5');
        
        const light = new THREE.AmbientLight(ambientColor, ambientIntensity);
        light.name = 'AmbientLight';
        scene.add(light);
        console.debug('Ambient light added:', ambientColor, 'intensity:', ambientIntensity);
    }

    // Directional light
    const directionalEnabled = urlParams.get('directional_enabled') !== 'false';
    if (directionalEnabled) {
        const directionalColor = urlParams.get('directional_color') || '#ffffff';
        const directionalIntensity = parseFloat(urlParams.get('directional_intensity') || '1');
        const directionalX = parseFloat(urlParams.get('directional_position_x') || '5');
        const directionalY = parseFloat(urlParams.get('directional_position_y') || '10');
        const directionalZ = parseFloat(urlParams.get('directional_position_z') || '5');
        
        const light = new THREE.DirectionalLight(directionalColor, directionalIntensity);
        light.name = 'DirectionalLight';
        light.position.set(directionalX, directionalY, directionalZ);
        light.castShadow = true;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.left = -10;
        light.shadow.camera.right = 10;
        light.shadow.camera.top = 10;
        light.shadow.camera.bottom = -10;
        scene.add(light);
        console.debug('Directional light added:', directionalColor, 'intensity:', directionalIntensity, 'position:', light.position);
    }

    // Top Spot Light
    const topSpotEnabled = urlParams.get('topspot_enabled') === 'true';
    if (topSpotEnabled) {
        const color = urlParams.get('topspot_color') || '#ffffff';
        const intensity = parseFloat(urlParams.get('topspot_intensity') || '1');
        const posX = parseFloat(urlParams.get('topspot_position_x') || '0');
        const posY = parseFloat(urlParams.get('topspot_position_y') || '10');
        const posZ = parseFloat(urlParams.get('topspot_position_z') || '0');
        const angle = parseFloat(urlParams.get('topspot_angle') || '45') * Math.PI / 180;
        const penumbra = parseFloat(urlParams.get('topspot_penumbra') || '0.1');
        const distance = parseFloat(urlParams.get('topspot_distance') || '0');
        
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
        light.name = 'TopSpot';
        light.position.set(posX, posY, posZ);
        light.castShadow = true;
        scene.add(light);
        console.debug('Top Spot Light added:', color, 'position:', light.position);
    }

    // Left Front Spot Light
    const leftFrontSpotEnabled = urlParams.get('leftfrontspot_enabled') === 'true';
    if (leftFrontSpotEnabled) {
        const color = urlParams.get('leftfrontspot_color') || '#ffffff';
        const intensity = parseFloat(urlParams.get('leftfrontspot_intensity') || '1');
        const posX = parseFloat(urlParams.get('leftfrontspot_position_x') || '-10');
        const posY = parseFloat(urlParams.get('leftfrontspot_position_y') || '10');
        const posZ = parseFloat(urlParams.get('leftfrontspot_position_z') || '10');
        const angle = parseFloat(urlParams.get('leftfrontspot_angle') || '45') * Math.PI / 180;
        const penumbra = parseFloat(urlParams.get('leftfrontspot_penumbra') || '0.1');
        const distance = parseFloat(urlParams.get('leftfrontspot_distance') || '0');
        
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
        light.name = 'LeftFrontSpot';
        light.position.set(posX, posY, posZ);
        light.castShadow = true;
        scene.add(light);
        console.debug('Left Front Spot Light added:', color, 'position:', light.position);
    }

    // Right Front Spot Light
    const rightFrontSpotEnabled = urlParams.get('rightfrontspot_enabled') === 'true';
    if (rightFrontSpotEnabled) {
        const color = urlParams.get('rightfrontspot_color') || '#ffffff';
        const intensity = parseFloat(urlParams.get('rightfrontspot_intensity') || '1');
        const posX = parseFloat(urlParams.get('rightfrontspot_position_x') || '10');
        const posY = parseFloat(urlParams.get('rightfrontspot_position_y') || '10');
        const posZ = parseFloat(urlParams.get('rightfrontspot_position_z') || '10');
        const angle = parseFloat(urlParams.get('rightfrontspot_angle') || '45') * Math.PI / 180;
        const penumbra = parseFloat(urlParams.get('rightfrontspot_penumbra') || '0.1');
        const distance = parseFloat(urlParams.get('rightfrontspot_distance') || '0');
        
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
        light.name = 'RightFrontSpot';
        light.position.set(posX, posY, posZ);
        light.castShadow = true;
        scene.add(light);
        console.debug('Right Front Spot Light added:', color, 'position:', light.position);
    }

    // Left Back Spot Light
    const leftBackSpotEnabled = urlParams.get('leftbackspot_enabled') === 'true';
    if (leftBackSpotEnabled) {
        const color = urlParams.get('leftbackspot_color') || '#ffffff';
        const intensity = parseFloat(urlParams.get('leftbackspot_intensity') || '1');
        const posX = parseFloat(urlParams.get('leftbackspot_position_x') || '-10');
        const posY = parseFloat(urlParams.get('leftbackspot_position_y') || '1');
        const posZ = parseFloat(urlParams.get('leftbackspot_position_z') || '-10');
        const angle = parseFloat(urlParams.get('leftbackspot_angle') || '45') * Math.PI / 180;
        const penumbra = parseFloat(urlParams.get('leftbackspot_penumbra') || '0.1');
        const distance = parseFloat(urlParams.get('leftbackspot_distance') || '0');
        
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
        light.name = 'LeftBackSpot';
        light.position.set(posX, posY, posZ);
        light.castShadow = true;
        scene.add(light);
        console.debug('Left Back Spot Light added:', color, 'position:', light.position);
    }

    // Right Back Spot Light
    const rightBackSpotEnabled = urlParams.get('rightbackspot_enabled') === 'true';
    if (rightBackSpotEnabled) {
        const color = urlParams.get('rightbackspot_color') || '#ffffff';
        const intensity = parseFloat(urlParams.get('rightbackspot_intensity') || '1');
        const posX = parseFloat(urlParams.get('rightbackspot_position_x') || '10');
        const posY = parseFloat(urlParams.get('rightbackspot_position_y') || '1');
        const posZ = parseFloat(urlParams.get('rightbackspot_position_z') || '-10');
        const angle = parseFloat(urlParams.get('rightbackspot_angle') || '45') * Math.PI / 180;
        const penumbra = parseFloat(urlParams.get('rightbackspot_penumbra') || '0.1');
        const distance = parseFloat(urlParams.get('rightbackspot_distance') || '0');
        
        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra);
        light.name = 'RightBackSpot';
        light.position.set(posX, posY, posZ);
        light.castShadow = true;
        scene.add(light);
        console.debug('Right Back Spot Light added:', color, 'position:', light.position);
    }

    // ============================================
    // LEGACY LIGHTING (Keep for backwards compatibility)
    // ============================================

    // Old-style ambient light (ambientLight=0xffffff&ambientIntensity=0.5)
    const ambientLight = urlParams.get('ambientLight');
    if (ambientLight) {
        const intensity = parseFloat(urlParams.get('ambientIntensity') || '1');
        let color;

        if (ambientLight.startsWith('0x')) {
            color = parseInt(ambientLight, 16);
        } else {
            color = new THREE.Color(ambientLight);
        }

        const light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
        console.debug('Legacy ambient light added:', color, 'intensity:', intensity);
    }

    // Directional light (directionalLight=0xffffff&directionalIntensity=1&directionalPosX=1&directionalPosY=1&directionalPosZ=1)
    const directionalLight = urlParams.get('directionalLight');
    if (directionalLight) {
        const intensity = parseFloat(urlParams.get('directionalIntensity') || '1');
        let color;

        if (directionalLight.startsWith('0x')) {
            color = parseInt(directionalLight, 16);
        } else {
            color = new THREE.Color(directionalLight);
        }

        const light = new THREE.DirectionalLight(color, intensity);

        // Position
        const posX = parseFloat(urlParams.get('directionalPosX') || '1');
        const posY = parseFloat(urlParams.get('directionalPosY') || '1');
        const posZ = parseFloat(urlParams.get('directionalPosZ') || '1');
        light.position.set(posX, posY, posZ);

        // Shadow settings
        const castShadow = urlParams.get('directionalShadow') === 'true';
        if (castShadow) {
            light.castShadow = true;

            // Shadow camera bounds
            const shadowSize = parseFloat(urlParams.get('directionalShadowSize') || '10');
            light.shadow.camera.left = -shadowSize;
            light.shadow.camera.right = shadowSize;
            light.shadow.camera.top = shadowSize;
            light.shadow.camera.bottom = -shadowSize;

            // Shadow map resolution
            const shadowMapSize = parseInt(urlParams.get('directionalShadowMapSize') || '1024');
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
        }

        scene.add(light);
        console.debug('Directional light added:', color, 'intensity:', intensity, 'position:', light.position);
    }

    // Hemisphere light (hemisphereLight=0xffffff&hemisphereGroundColor=0x444444&hemisphereIntensity=1)
    const hemisphereLight = urlParams.get('hemisphereLight');
    if (hemisphereLight) {
        const groundColor = urlParams.get('hemisphereGroundColor') || '0x444444';
        const intensity = parseFloat(urlParams.get('hemisphereIntensity') || '1');

        let skyColor, groundColorParsed;

        if (hemisphereLight.startsWith('0x')) {
            skyColor = parseInt(hemisphereLight, 16);
        } else {
            skyColor = new THREE.Color(hemisphereLight);
        }

        if (groundColor.startsWith('0x')) {
            groundColorParsed = parseInt(groundColor, 16);
        } else {
            groundColorParsed = new THREE.Color(groundColor);
        }

        const light = new THREE.HemisphereLight(skyColor, groundColorParsed, intensity);
        scene.add(light);
        console.debug('Hemisphere light added, sky:', skyColor, 'ground:', groundColorParsed, 'intensity:', intensity);
    }

    // Point light (pointLight=0xffffff&pointIntensity=1&pointPosX=0&pointPosY=2&pointPosZ=0&pointDistance=10&pointDecay=2)
    const pointLight = urlParams.get('pointLight');
    if (pointLight) {
        const intensity = parseFloat(urlParams.get('pointIntensity') || '1');
        const distance = parseFloat(urlParams.get('pointDistance') || '0');
        const decay = parseFloat(urlParams.get('pointDecay') || '2');

        let color;
        if (pointLight.startsWith('0x')) {
            color = parseInt(pointLight, 16);
        } else {
            color = new THREE.Color(pointLight);
        }

        const light = new THREE.PointLight(color, intensity, distance, decay);

        // Position
        const posX = parseFloat(urlParams.get('pointPosX') || '0');
        const posY = parseFloat(urlParams.get('pointPosY') || '2');
        const posZ = parseFloat(urlParams.get('pointPosZ') || '0');
        light.position.set(posX, posY, posZ);

        // Shadow settings
        const castShadow = urlParams.get('pointShadow') === 'true';
        if (castShadow) {
            light.castShadow = true;
            const shadowMapSize = parseInt(urlParams.get('pointShadowMapSize') || '1024');
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
        }

        scene.add(light);
        console.debug('Point light added:', color, 'intensity:', intensity, 'position:', light.position);
    }

    // Spot light (spotLight=0xffffff&spotIntensity=1&spotPosX=0&spotPosY=5&spotPosZ=0&spotAngle=0.5&spotPenumbra=0.2&spotDistance=0&spotDecay=2)
    const spotLight = urlParams.get('spotLight');
    if (spotLight) {
        const intensity = parseFloat(urlParams.get('spotIntensity') || '1');
        const distance = parseFloat(urlParams.get('spotDistance') || '0');
        const angle = parseFloat(urlParams.get('spotAngle') || '0.5');
        const penumbra = parseFloat(urlParams.get('spotPenumbra') || '0');
        const decay = parseFloat(urlParams.get('spotDecay') || '2');

        let color;
        if (spotLight.startsWith('0x')) {
            color = parseInt(spotLight, 16);
        } else {
            color = new THREE.Color(spotLight);
        }

        const light = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);

        // Position
        const posX = parseFloat(urlParams.get('spotPosX') || '0');
        const posY = parseFloat(urlParams.get('spotPosY') || '5');
        const posZ = parseFloat(urlParams.get('spotPosZ') || '0');
        light.position.set(posX, posY, posZ);

        // Target position
        const targetX = parseFloat(urlParams.get('spotTargetX') || '0');
        const targetY = parseFloat(urlParams.get('spotTargetY') || '0');
        const targetZ = parseFloat(urlParams.get('spotTargetZ') || '0');
        light.target.position.set(targetX, targetY, targetZ);
        scene.add(light.target);

        // Shadow settings
        const castShadow = urlParams.get('spotShadow') === 'true';
        if (castShadow) {
            light.castShadow = true;
            const shadowMapSize = parseInt(urlParams.get('spotShadowMapSize') || '1024');
            light.shadow.mapSize.width = shadowMapSize;
            light.shadow.mapSize.height = shadowMapSize;
        }

        scene.add(light);
        console.debug('Spot light added:', color, 'intensity:', intensity, 'position:', light.position, 'target:', light.target.position);
    }

    // ============================================
    // GROUND PLANE
    // ============================================

    const groundEnabled = urlParams.get('ground_enabled') !== 'false';
    if (groundEnabled) {
        const radius = parseFloat(urlParams.get('ground_radius') || '8');
        const segments = 64;
        
        const geometry = new THREE.CircleGeometry(radius, segments);
        const material = new THREE.MeshStandardMaterial({
            color: urlParams.get('ground_color') || '#dbdbdb',
            roughness: parseFloat(urlParams.get('ground_roughness') || '0.8'),
            metalness: parseFloat(urlParams.get('ground_metalness') || '0.2'),
            side: THREE.DoubleSide
        });
        
        const ground = new THREE.Mesh(geometry, material);
        ground.name = 'Ground';
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.receiveShadow = true;
        
        // Position
        const posX = parseFloat(urlParams.get('ground_position_x') || '0');
        const posY = parseFloat(urlParams.get('ground_position_y') || '0');
        const posZ = parseFloat(urlParams.get('ground_position_z') || '0');
        ground.position.set(posX, posY, posZ);
        
        scene.add(ground);
        console.debug('Ground plane added: radius', radius, 'at position:', ground.position);
    }

    console.debug('Scene configuration complete');

    // ============================================
    // APPLY CONTROLS SETTINGS FROM QUERY STRING
    // ============================================

    // Wait for controls to be initialized in app.js
    // Use a polling approach to check when controls are ready
    function waitForControls(callback, maxAttempts = 50, interval = 100) {
        let attempts = 0;
        const checkControls = setInterval(function () {
            attempts++;
            if (window.controls) {
                clearInterval(checkControls);
                callback();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkControls);
                console.debug('Controls not found after', maxAttempts * interval, 'ms');
            }
        }, interval);
    }

    waitForControls(function () {
        const controlsName = window.controls.constructor.name;
        console.debug('Applying settings to controls:', controlsName);

        // Set camera position BEFORE applying control settings
        // This ensures OrbitControls can properly initialize its internal state
        const cameraPositionX = urlParams.get('cameraPositionX');
        const cameraPositionY = urlParams.get('cameraPositionY');
        const cameraPositionZ = urlParams.get('cameraPositionZ');
        if (cameraPositionX !== null || cameraPositionY !== null || cameraPositionZ !== null) {
            if (cameraPositionX !== null) camera.position.x = parseFloat(cameraPositionX);
            if (cameraPositionY !== null) camera.position.y = parseFloat(cameraPositionY);
            if (cameraPositionZ !== null) camera.position.z = parseFloat(cameraPositionZ);
            console.debug('Camera position set:', camera.position.x, camera.position.y, camera.position.z);
        }

        // Set camera rotation BEFORE applying control settings
        const cameraRotationX = urlParams.get('cameraRotationX');
        const cameraRotationY = urlParams.get('cameraRotationY');
        const cameraRotationZ = urlParams.get('cameraRotationZ');
        if (cameraRotationX !== null || cameraRotationY !== null || cameraRotationZ !== null) {
            if (cameraRotationX !== null) camera.rotation.x = parseFloat(cameraRotationX) * Math.PI / 180;
            if (cameraRotationY !== null) camera.rotation.y = parseFloat(cameraRotationY) * Math.PI / 180;
            if (cameraRotationZ !== null) camera.rotation.z = parseFloat(cameraRotationZ) * Math.PI / 180;
            console.debug('Camera rotation set (degrees):', cameraRotationX, cameraRotationY, cameraRotationZ);
        }

        // OrbitControls / MapControls settings
        if (controlsName === 'OrbitControls' || controlsName === 'MapControls') {
            const minDistance = urlParams.get('minDistance');
            const maxDistance = urlParams.get('maxDistance');
            const minPolarAngle = urlParams.get('minPolarAngle');
            const maxPolarAngle = urlParams.get('maxPolarAngle');
            const minAzimuthAngle = urlParams.get('minAzimuthAngle');
            const maxAzimuthAngle = urlParams.get('maxAzimuthAngle');
            const dampingFactor = urlParams.get('dampingFactor');
            const enableDamping = urlParams.get('enableDamping');
            const enablePan = urlParams.get('enablePan');
            const enableZoom = urlParams.get('enableZoom');
            const enableRotate = urlParams.get('enableRotate');
            const autoRotate = urlParams.get('autoRotate');
            const autoRotateSpeed = urlParams.get('autoRotateSpeed');

            if (minDistance !== null) window.controls.minDistance = parseFloat(minDistance);
            if (maxDistance !== null) window.controls.maxDistance = parseFloat(maxDistance);
            if (minPolarAngle !== null) window.controls.minPolarAngle = parseFloat(minPolarAngle) * Math.PI / 180;
            if (maxPolarAngle !== null) window.controls.maxPolarAngle = parseFloat(maxPolarAngle) * Math.PI / 180;
            if (minAzimuthAngle !== null) window.controls.minAzimuthAngle = parseFloat(minAzimuthAngle) * Math.PI / 180;
            if (maxAzimuthAngle !== null) window.controls.maxAzimuthAngle = parseFloat(maxAzimuthAngle) * Math.PI / 180;
            if (dampingFactor !== null) window.controls.dampingFactor = parseFloat(dampingFactor);
            if (enableDamping !== null) window.controls.enableDamping = (enableDamping === 'true');
            if (enablePan !== null) window.controls.enablePan = (enablePan === 'true');
            if (enableZoom !== null) window.controls.enableZoom = (enableZoom === 'true');
            if (enableRotate !== null) window.controls.enableRotate = (enableRotate === 'true');
            if (autoRotate !== null) window.controls.autoRotate = (autoRotate === 'true');
            if (autoRotateSpeed !== null) window.controls.autoRotateSpeed = parseFloat(autoRotateSpeed);

            console.debug('OrbitControls/MapControls settings applied');
        }

        // TrackballControls settings
        if (controlsName === 'TrackballControls') {
            const rotateSpeed = urlParams.get('rotateSpeed');
            const zoomSpeed = urlParams.get('zoomSpeed');
            const panSpeed = urlParams.get('panSpeed');
            const staticMoving = urlParams.get('staticMoving');

            if (rotateSpeed !== null) window.controls.rotateSpeed = parseFloat(rotateSpeed);
            if (zoomSpeed !== null) window.controls.zoomSpeed = parseFloat(zoomSpeed);
            if (panSpeed !== null) window.controls.panSpeed = parseFloat(panSpeed);
            if (staticMoving !== null) window.controls.staticMoving = (staticMoving === 'true');

            console.debug('TrackballControls settings applied');
        }

        // FlyControls / FirstPersonControls settings
        if (controlsName === 'FlyControls' || controlsName === 'FirstPersonControls') {
            const movementSpeed = urlParams.get('movementSpeed');
            const rollSpeed = urlParams.get('rollSpeed');
            const dragToLook = urlParams.get('dragToLook');

            if (movementSpeed !== null) {
                window.controls.movementSpeed = parseFloat(movementSpeed);
                console.debug('Movement speed set to:', window.controls.movementSpeed);
            }
            if (rollSpeed !== null) {
                window.controls.rollSpeed = parseFloat(rollSpeed);
                console.debug('Roll speed set to:', window.controls.rollSpeed);
            }
            if (dragToLook !== null) {
                window.controls.dragToLook = (dragToLook === 'true');
                console.debug('Drag to look:', window.controls.dragToLook);
            }

            console.debug('FlyControls/FirstPersonControls settings applied');
        }

        // Ensure controls are enabled by default
        if (window.controls.enabled !== undefined) {
            // Only override if not explicitly set to false in query params
            const mouseEnabled = urlParams.get('mouseEnabled');
            if (mouseEnabled === null || mouseEnabled === 'true' || mouseEnabled === 'on') {
                window.controls.enabled = true;
            } else {
                window.controls.enabled = false;
            }
            console.debug('Mouse enabled:', window.controls.enabled);
        }

        // Make sure renderer domElement can receive keyboard focus
        if (renderer && renderer.domElement) {
            if (!renderer.domElement.hasAttribute('tabindex')) {
                renderer.domElement.setAttribute('tabindex', '0');
            }
            // Focus the element so keyboard and mouse events are captured
            renderer.domElement.focus();
            console.debug('Renderer domElement focused');
        }

        // Call controls.update() to activate all the settings we just applied
        if (window.controls && typeof window.controls.update === 'function') {
            window.controls.update();
            console.debug('Controls.update() called to activate settings');
        }
    });

    // ============================================
    // CUBE CAMERA FOR REAL-TIME REFLECTIONS
    // ============================================

    // Setup CubeCamera for reflective target object
    const useCubeCamera = urlParams.get('cubeCamera') === 'true';
    if (useCubeCamera) {
        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
            format: THREE.RGBAFormat,
            generateMipmaps: true,
            minFilter: THREE.LinearMipmapLinearFilter
        });

        const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget);
        scene.add(cubeCamera);

        // Find the Target object
        let targetObject = null;
        scene.traverse(function(child) {
            if (child.name === 'Target' && child.isMesh) {
                targetObject = child;
            }
        });

        if (targetObject) {
            // Position cube camera at target's position first
            cubeCamera.position.copy(targetObject.position);
            
            // Store references globally for animation loop access
            window.cubeCamera = cubeCamera;
            window.targetObject = targetObject;

            // Add update function to be called in animation loop
            window.updateCubeCamera = function() {
                if (window.targetObject && window.cubeCamera) {
                    // Position cube camera at target
                    window.cubeCamera.position.copy(window.targetObject.position);
                    
                    // Hide target before rendering cube camera
                    window.targetObject.visible = false;
                    
                    // Update cube camera
                    window.cubeCamera.update(renderer, scene);
                    
                    // Show target again
                    window.targetObject.visible = true;
                }
            };

            // Setup callback for when all scene resources are loaded
            window.onSceneLoaded = function() {
                if (window.updateCubeCamera && window.targetObject) {
                    // Log scene contents to debug
                    console.debug('=== CubeCamera Scene Analysis ===');
                    console.debug('Scene children count:', scene.children.length);
                    let groundFound = false;
                    scene.traverse(function(child) {
                        console.debug('Scene child:', child.name, child.type, 'visible:', child.visible);
                        if (child.name === 'Ground') {
                            console.debug('Ground FOUND:', {
                                name: child.name,
                                type: child.type,
                                visible: child.visible,
                                position: child.position,
                                rotation: child.rotation,
                                geometry: child.geometry,
                                material: child.material
                            });
                            groundFound = true;
                        }
                    });
                    
                    if (!groundFound) {
                        console.debug('Ground NOT found in scene!');
                    }
                    
                    console.debug('Target object:', window.targetObject.name, 'position:', window.targetObject.position);
                    console.debug('CubeCamera position:', window.cubeCamera.position);
                    
                    // Do initial cube camera render
                    window.updateCubeCamera();
                    console.debug('CubeCamera initial render completed');
                    
                    // NOW set the cube camera environment map on the target's material
                    if (window.targetObject.material) {
                        // Ensure material can show reflections
                        window.targetObject.material.envMap = window.cubeCamera.renderTarget.texture;
                        window.targetObject.material.envMapIntensity = parseFloat(urlParams.get('envMapIntensity') || '1.0');
                        
                        // For MeshStandardMaterial and MeshPhysicalMaterial, ensure proper reflection settings
                        if (window.targetObject.material.isMeshStandardMaterial || window.targetObject.material.isMeshPhysicalMaterial) {
                            // Set metalness and roughness for visible reflections
                            if (window.targetObject.material.metalness !== undefined && window.targetObject.material.metalness < 0.1) {
                                window.targetObject.material.metalness = 0.8; // Higher metalness = more reflective
                            }
                            if (window.targetObject.material.roughness !== undefined && window.targetObject.material.roughness > 0.5) {
                                window.targetObject.material.roughness = 0.2; // Lower roughness = sharper reflections
                            }
                        }
                        
                        window.targetObject.material.needsUpdate = true;
                        console.debug('CubeCamera environment map applied to Target object');
                        console.debug('Material settings:', {
                            metalness: window.targetObject.material.metalness,
                            roughness: window.targetObject.material.roughness,
                            envMapIntensity: window.targetObject.material.envMapIntensity
                        });
                        console.debug('=== CubeCamera Setup Complete ===');
                    }
                }
            };

            console.debug('CubeCamera initialized, waiting for scene resources to load');
        } else {
            console.debug('CubeCamera enabled but no Target object found in scene');
        }
    }

    // ============================================
    // UI OVERLAY - SETTINGS BUTTON AND MODAL
    // ============================================

    createSettingsUI();
}

function createSettingsUI() {
    const urlParams = new URLSearchParams(window.location.search);

    // Determine if settings button should be visible
    // Show if: running locally (localhost/127.0.0.1) OR debug=true query parameter
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' || 
                        window.location.hostname === '';
    const debugMode = urlParams.get('debug') === 'true';
    const showSettingsButton = isLocalhost || debugMode;

    console.debug('Settings button visibility:', {
        isLocalhost,
        debugMode,
        showSettingsButton,
        hostname: window.location.hostname
    });

    // Helper functions to get camera values
    function getCameraFov() {
        return urlParams.get('cameraFov') || (camera && camera.fov) || '50';
    }
    function getCameraNear() {
        return urlParams.get('cameraNear') || (camera && camera.near) || '0.1';
    }
    function getCameraFar() {
        return urlParams.get('cameraFar') || (camera && camera.far) || '1000';
    }
    function getCameraPositionX() {
        return urlParams.get('cameraPositionX') || (camera && camera.position.x) || '0';
    }
    function getCameraPositionY() {
        return urlParams.get('cameraPositionY') || (camera && camera.position.y) || '0';
    }
    function getCameraPositionZ() {
        return urlParams.get('cameraPositionZ') || (camera && camera.position.z) || '0';
    }
    function getCameraRotationX() {
        return urlParams.get('cameraRotationX') || (camera && (camera.rotation.x * 180 / Math.PI).toFixed(2)) || '0';
    }
    function getCameraRotationY() {
        return urlParams.get('cameraRotationY') || (camera && (camera.rotation.y * 180 / Math.PI).toFixed(2)) || '0';
    }
    function getCameraRotationZ() {
        return urlParams.get('cameraRotationZ') || (camera && (camera.rotation.z * 180 / Math.PI).toFixed(2)) || '0';
    }

    // Create settings button (conditionally shown based on environment)
    const settingsButton = document.createElement('button');
    settingsButton.id = 'settingsButton';
    settingsButton.innerHTML = 'Settings';
    settingsButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        z-index: 10000;
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-family: Arial, sans-serif;
        transition: all 0.3s;
        display: ${showSettingsButton ? 'block' : 'none'};
    `;
    settingsButton.onmouseover = function () {
        this.style.background = 'rgba(0, 0, 0, 0.95)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.6)';
    };
    settingsButton.onmouseout = function () {
        this.style.background = 'rgba(0, 0, 0, 0.8)';
        this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
    };
    document.body.appendChild(settingsButton);

    // Create modal overlay (backdrop with blur)
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'settingsModal';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        display: none;
        pointer-events: none;
    `;

    // Create modal content (slide-in panel)
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        position: fixed;
        top: 0;
        right: 0;
        width: 500px;
        max-width: 90vw;
        height: 100%;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-left: 2px solid #333;
        padding: 30px;
        color: white;
        font-family: Arial, sans-serif;
        overflow-y: auto;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.5);
        pointer-events: auto;
    `;

    // Create form
    const form = document.createElement('form');
    form.method = 'GET';
    form.action = window.location.pathname;

    // Pre-compute color picker values to avoid empty string errors
    const getBgColorValue = () => {
        const c = urlParams.get('bgColor');
        if (c && c.trim()) {
            return c.startsWith('0x') ? c.replace('0x', '#') : c.startsWith('#') ? c : '#000000';
        }
        return '#000000';
    };

    const getFogColorValue = () => {
        const c = urlParams.get('fogColor');
        if (c && c.trim()) {
            return c.startsWith('0x') ? c.replace('0x', '#') : c.startsWith('#') ? c : '#cccccc';
        }
        return '#cccccc';
    };

    const bgColorPickerValue = getBgColorValue();
    const fogColorPickerValue = getFogColorValue();

    // Form HTML
    form.innerHTML = `
        <div style="position: relative; margin-top: 0; margin-bottom: 30px; border-bottom: 2px solid #444; padding-bottom: 15px;">
            <h2 style="margin: 0; font-size: 28px; display: inline-block;">
                Experience
            </h2>
            <button id="closeModalHeader" type="button" style="
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: 2px solid #666;
                color: #fff;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 20px;
                line-height: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                padding: 0;
            " onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.borderColor='#999';" 
               onmouseout="this.style.background='transparent'; this.style.borderColor='#666';">
                ✕
            </button>
        </div>
        
        <!-- Renderer Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="renderer" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Renderer
            </h3>
            <div class="section-content" data-section="renderer" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Tone Mapping</label>
                    <select name="toneMapping" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="none" ${urlParams.get('toneMapping') === 'none' ? 'selected' : ''}>None</option>
                        <option value="linear" ${urlParams.get('toneMapping') === 'linear' ? 'selected' : ''}>Linear</option>
                        <option value="reinhard" ${urlParams.get('toneMapping') === 'reinhard' ? 'selected' : ''}>Reinhard</option>
                        <option value="cineon" ${urlParams.get('toneMapping') === 'cineon' ? 'selected' : ''}>Cineon</option>
                        <option value="acesfilmic" ${urlParams.get('toneMapping') === 'acesfilmic' ? 'selected' : ''}>ACES Filmic</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Tone Mapping Exposure</label>
                    <input type="number" name="toneMappingExposure" step="0.1" placeholder="1.0" value="${urlParams.get('toneMappingExposure') || '1.0'}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
        </div>
        
        <!-- Camera Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="camera" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Camera
            </h3>
            <div class="section-content" data-section="camera">
            <!-- Camera Lens Properties -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Lens Properties</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Field of View (FOV)</label>
                    <input type="number" name="cameraFov" min="0" max="180" step="1" placeholder="50" value="${getCameraFov()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Near Plane</label>
                    <input type="number" name="cameraNear" step="0.01" placeholder="0.1" value="${getCameraNear()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Far Plane</label>
                    <input type="number" name="cameraFar" step="1" placeholder="1000" value="${getCameraFar()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Camera Position -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Position</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="cameraPositionX" min="-100" max="100" step="0.001" placeholder="0" value="${getCameraPositionX()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="cameraPositionY" min="-100" max="100" step="0.001" placeholder="0" value="${getCameraPositionY()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="cameraPositionZ" min="-100" max="100" step="0.001" placeholder="0" value="${getCameraPositionZ()}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- CubeCamera Reflections -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Reflections</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="cubeCamera" ${urlParams.get('cubeCamera') === 'true' || urlParams.get('cubeCamera') === null ? 'checked' : ''} 
                            style="width: 18px; height: 18px; cursor: pointer;">
                        <span style="font-size: 14px;">Enable CubeCamera Reflections</span>
                    </label>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Environment Map Intensity</label>
                    <input type="number" name="envMapIntensity" min="0" max="5" step="0.1" placeholder="1.0" value="${urlParams.get('envMapIntensity') || '1.0'}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            </div>
        </div>
        
        <!-- Controls Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="controls" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Controls
            </h3>
            <div class="section-content" data-section="controls" style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Controls Type</label>
                    <select id="controlsTypeSelect" name="controls" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="orbit" ${urlParams.get('controls') === 'orbit' ? 'selected' : ''}>Orbit Controls</option>
                        <option value="map" ${urlParams.get('controls') === 'map' ? 'selected' : ''}>Map Controls</option>
                        <option value="trackball" ${urlParams.get('controls') === 'trackball' ? 'selected' : ''}>Trackball Controls</option>
                        <option value="fly" ${urlParams.get('controls') === 'fly' ? 'selected' : ''}>Fly Controls</option>
                        <option value="firstperson" ${urlParams.get('controls') === 'firstperson' ? 'selected' : ''}>First Person Controls</option>
                        <option value="pointerlock" ${urlParams.get('controls') === 'pointerlock' ? 'selected' : ''}>Pointer Lock Controls</option>
                        <option value="transform" ${urlParams.get('controls') === 'transform' ? 'selected' : ''}>Transform Controls</option>
                        <option value="drag" ${urlParams.get('controls') === 'drag' ? 'selected' : ''}>Drag Controls</option>
                        <option value="arcball" ${urlParams.get('controls') === 'arcball' ? 'selected' : ''}>Arcball Controls</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Camera Target Object Name</label>
                    <input type="text" name="target" placeholder="Target" value="${urlParams.get('target') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: flex; align-items: center; font-size: 14px; cursor: pointer;">
                        <input type="checkbox" name="mouseEnabled" ${urlParams.get('mouseEnabled') !== 'false' ? 'checked' : ''} 
                            style="width: 18px; height: 18px; margin-right: 8px; cursor: pointer;">
                        Mouse Input Enabled
                    </label>
                </div>
            
                <!-- Orbit/Map Controls Settings -->
                <div id="orbitControlsSettings" style="margin-top: 15px; display: none;">
                    <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Orbit/Map Controls</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Min Distance</label>
                            <input type="number" name="minDistance" step="0.1" placeholder="0" value="${urlParams.get('minDistance') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Max Distance</label>
                            <input type="number" name="maxDistance" step="1" placeholder="Infinity" value="${urlParams.get('maxDistance') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Min Polar Angle (deg)</label>
                            <input type="number" name="minPolarAngle" step="1" placeholder="0" value="${urlParams.get('minPolarAngle') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Max Polar Angle (deg)</label>
                            <input type="number" name="maxPolarAngle" step="1" placeholder="180" value="${urlParams.get('maxPolarAngle') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Min Azimuth Angle (deg)</label>
                            <input type="number" name="minAzimuthAngle" step="1" placeholder="-Infinity" value="${urlParams.get('minAzimuthAngle') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Max Azimuth Angle (deg)</label>
                            <input type="number" name="maxAzimuthAngle" step="1" placeholder="Infinity" value="${urlParams.get('maxAzimuthAngle') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Damping Factor</label>
                            <input type="number" name="dampingFactor" step="0.01" min="0" max="1" placeholder="0.05" value="${urlParams.get('dampingFactor') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enable Damping</label>
                            <select name="enableDamping" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('enableDamping') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('enableDamping') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enable Pan</label>
                            <select name="enablePan" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('enablePan') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('enablePan') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enable Zoom</label>
                            <select name="enableZoom" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('enableZoom') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('enableZoom') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enable Rotate</label>
                            <select name="enableRotate" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('enableRotate') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('enableRotate') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Auto Rotate</label>
                            <select name="autoRotate" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('autoRotate') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('autoRotate') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Auto Rotate Speed</label>
                            <input type="number" name="autoRotateSpeed" step="0.001" placeholder="0.02" value="${urlParams.get('autoRotateSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                    </div>
                </div>
            
                <!-- Trackball Controls Settings -->
                <div id="trackballControlsSettings" style="margin-top: 15px; display: none;">
                    <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Trackball Controls</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Rotate Speed</label>
                            <input type="number" name="rotateSpeed" step="0.1" placeholder="1.0" value="${urlParams.get('rotateSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Zoom Speed</label>
                            <input type="number" name="zoomSpeed" step="0.1" placeholder="1.2" value="${urlParams.get('zoomSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Pan Speed</label>
                            <input type="number" name="panSpeed" step="0.1" placeholder="0.3" value="${urlParams.get('panSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Static Moving</label>
                            <select name="staticMoving" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('staticMoving') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('staticMoving') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <!-- Fly Controls -->
                <div id="flyControlsSettings" style="margin-top: 15px; display: none;">
                    <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Fly Controls</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Movement Speed</label>
                            <input type="number" name="movementSpeed" step="0.1" placeholder="1.0" value="${urlParams.get('movementSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Rollspeed</label>
                            <input type="number" name="rollSpeed" step="0.01" placeholder="0.005" value="${urlParams.get('rollSpeed') || ''}" 
                                style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-size: 14px;">Drag to Look</label>
                            <select name="dragToLook" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                                <option value="">Default</option>
                                <option value="true" ${urlParams.get('dragToLook') === 'true' ? 'selected' : ''}>Yes</option>
                                <option value="false" ${urlParams.get('dragToLook') === 'false' ? 'selected' : ''}>No</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Background Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="background" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Background
            </h3>
            <div class="section-content" data-section="background" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Background Color</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="bgColorText" name="bgColor" placeholder="#000000 or 0x000000" value="${urlParams.get('bgColor') || ''}" 
                            style="flex: 1; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <input type="color" id="bgColorPicker" value="${bgColorPickerValue}" 
                            style="width: 50px; height: 38px; padding: 2px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                    </div>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Background Texture URL</label>
                    <input type="search" name="bgTexture" list="bgTextureList" placeholder="path/to/texture.jpg" value="${urlParams.get('bgTexture') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                    <datalist id="bgTextureList">
                        <option value="assets/360_images/black.jpg">
                        <option value="assets/360_images/blue_photo_studio_4k.jpg">
                        <option value="assets/360_images/brown_photostudio_06_4k.jpg">
                        <option value="assets/360_images/clouds.jpg">
                        <option value="assets/360_images/concrete_tunnel_4k.jpg">
                        <option value="assets/360_images/dancing_hall_4k.jpg">
                        <option value="assets/360_images/dusk.jpg">
                        <option value="assets/360_images/graffiti_shelter_4k.jpg">
                        <option value="assets/360_images/hall_of_finfish_4k.jpg">
                        <option value="assets/360_images/lapa_4k.jpg">
                        <option value="assets/360_images/large_corridor_4k.jpg">
                        <option value="assets/360_images/lighter_clouds.jpg">
                        <option value="assets/360_images/moonless_golf_4k.jpg">
                        <option value="assets/360_images/photo_studio_loft_hall_4k.jpg">
                        <option value="assets/360_images/pillars_4k.jpg">
                        <option value="assets/360_images/rogland_clear_night_4k.jpg">
                        <option value="assets/360_images/shanghai_bund_4k.jpg">
                        <option value="assets/360_images/teufelsberg_lookout_4k.jpg">
                        <option value="assets/360_images/tv_studio_4k.jpg">
                        <option value="assets/360_images/vintage_measuring_lab_4k.jpg">
                        <option value="assets/360_images/vulture_hide_4k.jpg">
                        <option value="assets/360_images/wrestling_gym_4k.jpg">
                    </datalist>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">360° Background</label>
                    <select name="bg360" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="false" ${urlParams.get('bg360') === 'false' ? 'selected' : ''}>No</option>
                        <option value="true" ${urlParams.get('bg360') === 'true' ? 'selected' : ''}>Yes</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Background Color Space</label>
                    <select name="bgColorSpace" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value=""></option>
                        <option value="srgb" ${urlParams.get('bgColorSpace') === 'srgb' ? 'selected' : ''}>sRGB</option>
                        <option value="linear" ${urlParams.get('bgColorSpace') === 'linear' ? 'selected' : ''}>Linear</option>
                    </select>
                </div>
            </div>
            </div>
        </div>
        
        <!-- Fog Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="fog" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Fog
            </h3>
            <div class="section-content" data-section="fog" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Fog Type</label>
                    <select id="fogTypeSelect" name="fogType" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="">None</option>
                        <option value="linear" ${urlParams.get('fogType') === 'linear' ? 'selected' : ''}>Linear</option>
                        <option value="exp" ${urlParams.get('fogType') === 'exp' ? 'selected' : ''}>Exponential</option>
                        <option value="exp2" ${urlParams.get('fogType') === 'exp2' ? 'selected' : ''}>Exponential²</option>
                    </select>
                </div>
                <div id="fogColorContainer" style="grid-column: span 2; display: none;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Fog Color</label>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <input type="text" id="fogColorText" name="fogColor" placeholder="#cccccc" value="${urlParams.get('fogColor') || ''}" 
                            style="flex: 1; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <input type="color" id="fogColorPicker" value="${fogColorPickerValue}" 
                            style="width: 50px; height: 38px; padding: 2px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                    </div>
                </div>
                <div id="fogNearContainer" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Fog Near (Linear)</label>
                    <input type="number" name="fogNear" step="0.1" placeholder="1" value="${urlParams.get('fogNear') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div id="fogFarContainer" style="display: none;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Fog Far (Linear)</label>
                    <input type="number" name="fogFar" step="1" placeholder="1000" value="${urlParams.get('fogFar') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div id="fogDensityContainer" style="grid-column: span 2; display: none;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Fog Density (Exponential)</label>
                    <input type="number" name="fogDensity" step="0.00001" placeholder="0.00025" value="${urlParams.get('fogDensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            </div>
        </div>
        
        <!-- Lighting Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="lighting" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Lighting
            </h3>
            <div class="section-content" data-section="lighting">
            
            <!-- Ambient Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Ambient Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="ambient_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('ambient_enabled') !== 'false' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('ambient_enabled') === 'false' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="ambient_intensity" step="0.1" min="0" placeholder="0.5" value="${urlParams.get('ambient_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="ambient_color" value="${urlParams.get('ambient_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
            </div>
            
            <!-- Directional Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Directional Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="directional_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('directional_enabled') !== 'false' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('directional_enabled') === 'false' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="directional_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('directional_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="directional_color" value="${urlParams.get('directional_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="directional_position_x" step="0.5" placeholder="5" value="${urlParams.get('directional_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="directional_position_y" step="0.5" placeholder="10" value="${urlParams.get('directional_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="directional_position_z" step="0.5" placeholder="5" value="${urlParams.get('directional_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Top Spot Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Top Spot Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="topspot_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('topspot_enabled') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('topspot_enabled') !== 'true' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="topspot_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('topspot_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="topspot_color" value="${urlParams.get('topspot_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="topspot_position_x" step="0.5" placeholder="0" value="${urlParams.get('topspot_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="topspot_position_y" step="0.5" placeholder="10" value="${urlParams.get('topspot_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="topspot_position_z" step="0.5" placeholder="0" value="${urlParams.get('topspot_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Angle (degrees)</label>
                    <input type="number" name="topspot_angle" step="1" min="0" max="90" placeholder="45" value="${urlParams.get('topspot_angle') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Penumbra</label>
                    <input type="number" name="topspot_penumbra" step="0.1" min="0" max="1" placeholder="0.1" value="${urlParams.get('topspot_penumbra') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Distance</label>
                    <input type="number" name="topspot_distance" step="1" min="0" placeholder="0" value="${urlParams.get('topspot_distance') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Left Front Spot Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Left Front Spot Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="leftfrontspot_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('leftfrontspot_enabled') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('leftfrontspot_enabled') !== 'true' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="leftfrontspot_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('leftfrontspot_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="leftfrontspot_color" value="${urlParams.get('leftfrontspot_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="leftfrontspot_position_x" step="0.5" placeholder="-10" value="${urlParams.get('leftfrontspot_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="leftfrontspot_position_y" step="0.5" placeholder="10" value="${urlParams.get('leftfrontspot_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="leftfrontspot_position_z" step="0.5" placeholder="10" value="${urlParams.get('leftfrontspot_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Angle (degrees)</label>
                    <input type="number" name="leftfrontspot_angle" step="1" min="0" max="90" placeholder="45" value="${urlParams.get('leftfrontspot_angle') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Penumbra</label>
                    <input type="number" name="leftfrontspot_penumbra" step="0.1" min="0" max="1" placeholder="0.1" value="${urlParams.get('leftfrontspot_penumbra') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Distance</label>
                    <input type="number" name="leftfrontspot_distance" step="1" min="0" placeholder="0" value="${urlParams.get('leftfrontspot_distance') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Right Front Spot Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Right Front Spot Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="rightfrontspot_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('rightfrontspot_enabled') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('rightfrontspot_enabled') !== 'true' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="rightfrontspot_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('rightfrontspot_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="rightfrontspot_color" value="${urlParams.get('rightfrontspot_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="rightfrontspot_position_x" step="0.5" placeholder="10" value="${urlParams.get('rightfrontspot_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="rightfrontspot_position_y" step="0.5" placeholder="10" value="${urlParams.get('rightfrontspot_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="rightfrontspot_position_z" step="0.5" placeholder="10" value="${urlParams.get('rightfrontspot_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Angle (degrees)</label>
                    <input type="number" name="rightfrontspot_angle" step="1" min="0" max="90" placeholder="45" value="${urlParams.get('rightfrontspot_angle') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Penumbra</label>
                    <input type="number" name="rightfrontspot_penumbra" step="0.1" min="0" max="1" placeholder="0.1" value="${urlParams.get('rightfrontspot_penumbra') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Distance</label>
                    <input type="number" name="rightfrontspot_distance" step="1" min="0" placeholder="0" value="${urlParams.get('rightfrontspot_distance') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Left Back Spot Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Left Back Spot Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="leftbackspot_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('leftbackspot_enabled') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('leftbackspot_enabled') !== 'true' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="leftbackspot_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('leftbackspot_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="leftbackspot_color" value="${urlParams.get('leftbackspot_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="leftbackspot_position_x" step="0.5" placeholder="-10" value="${urlParams.get('leftbackspot_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="leftbackspot_position_y" step="0.5" placeholder="1" value="${urlParams.get('leftbackspot_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="leftbackspot_position_z" step="0.5" placeholder="-10" value="${urlParams.get('leftbackspot_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Angle (degrees)</label>
                    <input type="number" name="leftbackspot_angle" step="1" min="0" max="90" placeholder="45" value="${urlParams.get('leftbackspot_angle') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Penumbra</label>
                    <input type="number" name="leftbackspot_penumbra" step="0.1" min="0" max="1" placeholder="0.1" value="${urlParams.get('leftbackspot_penumbra') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Distance</label>
                    <input type="number" name="leftbackspot_distance" step="1" min="0" placeholder="0" value="${urlParams.get('leftbackspot_distance') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Right Back Spot Light -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Right Back Spot Light</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Enabled</label>
                    <select name="rightbackspot_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('rightbackspot_enabled') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('rightbackspot_enabled') !== 'true' ? 'selected' : ''}>No</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Intensity</label>
                    <input type="number" name="rightbackspot_intensity" step="0.1" min="0" placeholder="1" value="${urlParams.get('rightbackspot_intensity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Color</label>
                    <input type="color" name="rightbackspot_color" value="${urlParams.get('rightbackspot_color') || '#ffffff'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="rightbackspot_position_x" step="0.5" placeholder="10" value="${urlParams.get('rightbackspot_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="rightbackspot_position_y" step="0.5" placeholder="1" value="${urlParams.get('rightbackspot_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="rightbackspot_position_z" step="0.5" placeholder="-10" value="${urlParams.get('rightbackspot_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Angle (degrees)</label>
                    <input type="number" name="rightbackspot_angle" step="1" min="0" max="90" placeholder="45" value="${urlParams.get('rightbackspot_angle') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Penumbra</label>
                    <input type="number" name="rightbackspot_penumbra" step="0.1" min="0" max="1" placeholder="0.1" value="${urlParams.get('rightbackspot_penumbra') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div style="grid-column: span 2;">
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Distance</label>
                    <input type="number" name="rightbackspot_distance" step="1" min="0" placeholder="0" value="${urlParams.get('rightbackspot_distance') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            </div>
        </div>
        
        <!-- Ground Settings -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="ground" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px;">
                <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                Ground
            </h3>
            <div class="section-content" data-section="ground">
            <!-- Enable/Disable -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-size: 14px;">Ground Plane Enabled</label>
                <select name="ground_enabled" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                    <option value="true" ${urlParams.get('ground_enabled') !== 'false' ? 'selected' : ''}>Yes</option>
                    <option value="false" ${urlParams.get('ground_enabled') === 'false' ? 'selected' : ''}>No</option>
                </select>
            </div>
            <!-- Geometry & Transform -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Geometry & Transform</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Radius</label>
                    <input type="number" name="ground_radius" step="0.1" placeholder="10" value="${urlParams.get('ground_radius') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position X</label>
                    <input type="number" name="ground_position_x" step="0.1" placeholder="0" value="${urlParams.get('ground_position_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Y</label>
                    <input type="number" name="ground_position_y" step="0.1" placeholder="0" value="${urlParams.get('ground_position_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Position Z</label>
                    <input type="number" name="ground_position_z" step="0.1" placeholder="0" value="${urlParams.get('ground_position_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Rotation X (deg)</label>
                    <input type="number" name="ground_rotation_x" step="1" placeholder="-90" value="${urlParams.get('ground_rotation_x') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Rotation Y (deg)</label>
                    <input type="number" name="ground_rotation_y" step="1" placeholder="0" value="${urlParams.get('ground_rotation_y') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Rotation Z (deg)</label>
                    <input type="number" name="ground_rotation_z" step="1" placeholder="0" value="${urlParams.get('ground_rotation_z') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            
            <!-- Material Properties -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Material Properties</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Roughness</label>
                    <input type="number" name="ground_roughness" step="0.01" min="0" max="1" placeholder="0.8" value="${urlParams.get('ground_roughness') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Metalness</label>
                    <input type="number" name="ground_metalness" step="0.01" min="0" max="1" placeholder="0" value="${urlParams.get('ground_metalness') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Opacity</label>
                    <input type="number" name="ground_opacity" step="0.01" min="0" max="1" placeholder="1" value="${urlParams.get('ground_opacity') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Side</label>
                    <select name="ground_side" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="front" ${urlParams.get('ground_side') === 'front' ? 'selected' : ''}>Front</option>
                        <option value="back" ${urlParams.get('ground_side') === 'back' ? 'selected' : ''}>Back</option>
                        <option value="double" ${urlParams.get('ground_side') === 'double' ? 'selected' : ''}>Double</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Blending</label>
                    <select name="ground_blending" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="normal" ${urlParams.get('ground_blending') === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="additive" ${urlParams.get('ground_blending') === 'additive' ? 'selected' : ''}>Additive</option>
                        <option value="subtractive" ${urlParams.get('ground_blending') === 'subtractive' ? 'selected' : ''}>Subtractive</option>
                        <option value="multiply" ${urlParams.get('ground_blending') === 'multiply' ? 'selected' : ''}>Multiply</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Transparent</label>
                    <select name="ground_transparent" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="true" ${urlParams.get('ground_transparent') === 'true' ? 'selected' : ''}>Yes</option>
                        <option value="false" ${urlParams.get('ground_transparent') === 'false' ? 'selected' : ''}>No</option>
                    </select>
                </div>
            </div>
            
            <!-- Texture Maps -->
            <h4 style="font-size: 16px; margin: 15px 0 10px 0; color: #888;">Texture Maps</h4>
            <div style="display: grid; grid-template-columns: 1fr; gap: 15px;">
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Material</label>
                    <select id="groundMaterialSelect" name="ground_material" style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                        <option value="">None</option>
                        <option value="BarkPoplar001" ${urlParams.get('ground_material') === 'BarkPoplar001' ? 'selected' : ''}>Bark Poplar</option>
                        <option value="BricksDragfacedRunning008" ${urlParams.get('ground_material') === 'BricksDragfacedRunning008' ? 'selected' : ''}>Bricks Dragfaced Running</option>
                        <option value="GroundDirtRocky020" ${urlParams.get('ground_material') === 'GroundDirtRocky020' ? 'selected' : ''}>Ground Dirt Rocky</option>
                        <option value="GroundDirtWeedsPatchy004" ${urlParams.get('ground_material') === 'GroundDirtWeedsPatchy004' ? 'selected' : ''}>Ground Dirt Weeds Patchy</option>
                        <option value="GroundSand005" ${urlParams.get('ground_material') === 'GroundSand005' ? 'selected' : ''}>Ground Sand</option>
                        <option value="GroundWoodChips001" ${urlParams.get('ground_material') === 'GroundWoodChips001' ? 'selected' : ''}>Ground Wood Chips</option>
                        <option value="MetalCorrodedHeavy001" ${urlParams.get('ground_material') === 'MetalCorrodedHeavy001' ? 'selected' : ''}>Metal Corroded Heavy</option>
                        <option value="MetalGalvanizedSteelWorn001" ${urlParams.get('ground_material') === 'MetalGalvanizedSteelWorn001' ? 'selected' : ''}>Metal Galvanized Steel Worn</option>
                        <option value="Poliigon_BrickReclaimedRunning_7787" ${urlParams.get('ground_material') === 'Poliigon_BrickReclaimedRunning_7787' ? 'selected' : ''}>Brick Reclaimed Running</option>
                        <option value="Poliigon_BrickWallReclaimed_8320" ${urlParams.get('ground_material') === 'Poliigon_BrickWallReclaimed_8320' ? 'selected' : ''}>Brick Wall Reclaimed</option>
                        <option value="Poliigon_ClayCeramicGlossy_5212" ${urlParams.get('ground_material') === 'Poliigon_ClayCeramicGlossy_5212' ? 'selected' : ''}>Clay Ceramic Glossy</option>
                        <option value="Poliigon_ConcreteFloorPoured_7656" ${urlParams.get('ground_material') === 'Poliigon_ConcreteFloorPoured_7656' ? 'selected' : ''}>Concrete Floor Poured</option>
                        <option value="Poliigon_ConcretePaversSquare_7100" ${urlParams.get('ground_material') === 'Poliigon_ConcretePaversSquare_7100' ? 'selected' : ''}>Concrete Pavers Square</option>
                        <option value="Poliigon_GrassPatchyGround_4585" ${urlParams.get('ground_material') === 'Poliigon_GrassPatchyGround_4585' ? 'selected' : ''}>Grass Patchy Ground</option>
                        <option value="Poliigon_MetalBronzeWorn_7248" ${urlParams.get('ground_material') === 'Poliigon_MetalBronzeWorn_7248' ? 'selected' : ''}>Metal Bronze Worn</option>
                        <option value="Poliigon_MetalPaintedMatte_7037" ${urlParams.get('ground_material') === 'Poliigon_MetalPaintedMatte_7037' ? 'selected' : ''}>Metal Painted Matte</option>
                        <option value="Poliigon_MetalRust_7642" ${urlParams.get('ground_material') === 'Poliigon_MetalRust_7642' ? 'selected' : ''}>Metal Rust</option>
                        <option value="Poliigon_MetalSteelBrushed_7174" ${urlParams.get('ground_material') === 'Poliigon_MetalSteelBrushed_7174' ? 'selected' : ''}>Metal Steel Brushed</option>
                        <option value="Poliigon_PlasterPainted_7664" ${urlParams.get('ground_material') === 'Poliigon_PlasterPainted_7664' ? 'selected' : ''}>Plaster Painted</option>
                        <option value="Poliigon_PlasticMoldWorn_7486" ${urlParams.get('ground_material') === 'Poliigon_PlasticMoldWorn_7486' ? 'selected' : ''}>Plastic Mold Worn</option>
                        <option value="Poliigon_RattanWeave_6945" ${urlParams.get('ground_material') === 'Poliigon_RattanWeave_6945' ? 'selected' : ''}>Rattan Weave</option>
                        <option value="Poliigon_SlateFloorTile_7657" ${urlParams.get('ground_material') === 'Poliigon_SlateFloorTile_7657' ? 'selected' : ''}>Slate Floor Tile</option>
                        <option value="Poliigon_StoneQuartzite_8060" ${urlParams.get('ground_material') === 'Poliigon_StoneQuartzite_8060' ? 'selected' : ''}>Stone Quartzite</option>
                        <option value="Poliigon_TerrazzoTilePolished_4818" ${urlParams.get('ground_material') === 'Poliigon_TerrazzoTilePolished_4818' ? 'selected' : ''}>Terrazzo Tile Polished</option>
                        <option value="Poliigon_WoodRoofShingle_7834" ${urlParams.get('ground_material') === 'Poliigon_WoodRoofShingle_7834' ? 'selected' : ''}>Wood Roof Shingle</option>
                        <option value="Poliigon_WoodVeneerOak_7760" ${urlParams.get('ground_material') === 'Poliigon_WoodVeneerOak_7760' ? 'selected' : ''}>Wood Veneer Oak</option>
                        <option value="RammedEarth006" ${urlParams.get('ground_material') === 'RammedEarth006' ? 'selected' : ''}>Rammed Earth 006</option>
                        <option value="RammedEarth018" ${urlParams.get('ground_material') === 'RammedEarth018' ? 'selected' : ''}>Rammed Earth 018</option>
                        <option value="StoneBricksSplitface001" ${urlParams.get('ground_material') === 'StoneBricksSplitface001' ? 'selected' : ''}>Stone Bricks Splitface</option>
                        <option value="TerrazzoSlab018" ${urlParams.get('ground_material') === 'TerrazzoSlab018' ? 'selected' : ''}>Terrazzo Slab 018</option>
                        <option value="TerrazzoSlab028" ${urlParams.get('ground_material') === 'TerrazzoSlab028' ? 'selected' : ''}>Terrazzo Slab 028</option>
                        <option value="TilesCeramicHerringbone002" ${urlParams.get('ground_material') === 'TilesCeramicHerringbone002' ? 'selected' : ''}>Tiles Ceramic Herringbone</option>
                        <option value="TilesMosaicPennyround001" ${urlParams.get('ground_material') === 'TilesMosaicPennyround001' ? 'selected' : ''}>Tiles Mosaic Pennyround</option>
                        <option value="TilesMosaicYubi003" ${urlParams.get('ground_material') === 'TilesMosaicYubi003' ? 'selected' : ''}>Tiles Mosaic Yubi</option>
                        <option value="TilesSquarePoolMixed001" ${urlParams.get('ground_material') === 'TilesSquarePoolMixed001' ? 'selected' : ''}>Tiles Square Pool Mixed</option>
                        <option value="TilesTerracottaBeigeSquareStacked001" ${urlParams.get('ground_material') === 'TilesTerracottaBeigeSquareStacked001' ? 'selected' : ''}>Tiles Terracotta Beige Square Stacked</option>
                        <option value="TilesTravertine001" ${urlParams.get('ground_material') === 'TilesTravertine001' ? 'selected' : ''}>Tiles Travertine</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Texture Repeat</label>
                    <input type="number" name="ground_texture_repeat" step="1" min="0" placeholder="1" value="${urlParams.get('ground_texture_repeat') || ''}" 
                        style="width: 100%; padding: 8px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 5px; font-size: 14px;">Ground Color (when no texture)</label>
                    <input type="color" name="ground_color" value="${urlParams.get('ground_color') || '#808080'}" 
                        style="width: 100%; height: 40px; padding: 4px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; cursor: pointer;">
                </div>
            </div>
            </div>
        </div>
        
        <!-- Target Objects (Multiple) -->
        <div style="margin-bottom: 30px;">
            <h3 class="section-header" data-section="targets" style="font-size: 20px; margin-bottom: 15px; color: #4a9eff; cursor: pointer; user-select: none; display: flex; align-items: center; gap: 8px; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="collapse-arrow" style="transition: transform 0.3s;">▼</span>
                    Target Objects
                </div>
                <button type="button" id="addTargetBtn" style="padding: 6px 12px; background: #4a9eff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;">
                    + Add Target
                </button>
            </h3>
            <div class="section-content" data-section="targets" id="targetsContainer">
            <!-- Target objects will be dynamically added here -->
            </div>
        </div>
        
        <!-- Reload Warning Message -->
        <div id="cubeCameraWarning" style="display: none; padding: 12px 20px; background: #664400; border: 2px solid #ff9900; border-radius: 6px; margin-top: 20px; color: #ffcc66;">
            <strong>⚠️ Reload Required:</strong> This change requires a page refresh. Click <strong>APPLY SETTINGS</strong> to update.
        </div>
        
        <!-- QR Code Container -->
        <div id="qrCodeContainer" style="display: none; padding: 20px; background: #1a1a1a; border: 2px solid #9d2a9d; border-radius: 6px; margin-top: 20px; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #9d2a9d;">Scan QR Code</h3>
            <div id="qrCodeCanvas" style="display: inline-block; background: white; padding: 10px; border-radius: 4px;"></div>
            <p style="margin: 15px 0 0 0; color: #aaa; font-size: 14px;">Scan this code with your mobile device to open this scene</p>
            <button type="button" id="closeQRBtn" style="margin-top: 15px; padding: 8px 20px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Close
            </button>
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #444;">
            <button type="button" id="saveImageBtn" style="padding: 12px 30px; background: #2a2a2a; color: white; border: 1px solid #444; border-radius: 4px;">
                </div>
            </div>
            </div>
        </div>
        
        <!-- Reload Warning Message -->
        <div id="cubeCameraWarning" style="display: none; padding: 12px 20px; background: #664400; border: 2px solid #ff9900; border-radius: 6px; margin-top: 20px; color: #ffcc66;">
            <strong>⚠️ Reload Required:</strong> This change requires a page refresh. Click <strong>APPLY SETTINGS</strong> to update.
        </div>
        
        <!-- Action Buttons -->
        <div style="display: flex; gap: 15px; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 2px solid #444;">
            <button type="button" id="closeModal" style="padding: 12px 30px; background: #444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
                Cancel
            </button>
            <button type="submit" style="padding: 12px 30px; background: #4a9eff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold;">
                Apply Settings
            </button>
            <br>
        </div>
        </br>
    `;

    modalContent.appendChild(form);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // ============================================
    // ACCORDION FUNCTIONALITY WITH LOCALSTORAGE
    // ============================================

    const STORAGE_KEY = 'threejs-settings-accordion-state';

    // Load saved accordion state from localStorage
    function loadAccordionState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.debug('Failed to load accordion state:', e);
            return {};
        }
    }

    // Save accordion state to localStorage
    function saveAccordionState(sectionName, isOpen) {
        try {
            const state = loadAccordionState();
            state[sectionName] = isOpen;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.debug('Failed to save accordion state:', e);
        }
    }

    // Toggle section visibility
    function toggleSection(sectionName) {
        const content = form.querySelector(`.section-content[data-section="${sectionName}"]`);
        const header = form.querySelector(`.section-header[data-section="${sectionName}"]`);
        const arrow = header ? header.querySelector('.collapse-arrow') : null;

        if (content) {
            const isCurrentlyVisible = content.style.display !== 'none';
            const newVisibility = !isCurrentlyVisible;

            // Toggle visibility
            content.style.display = newVisibility ? '' : 'none';

            // Rotate arrow
            if (arrow) {
                arrow.style.transform = newVisibility ? 'rotate(0deg)' : 'rotate(-90deg)';
            }

            // Save state
            saveAccordionState(sectionName, newVisibility);
        }
    }

    // Initialize accordion state
    function initializeAccordion() {
        const savedState = loadAccordionState();
        const sections = ['renderer', 'camera', 'controls', 'background', 'fog', 'ground'];

        sections.forEach(sectionName => {
            const header = form.querySelector(`.section-header[data-section="${sectionName}"]`);
            const content = form.querySelector(`.section-content[data-section="${sectionName}"]`);
            const arrow = header ? header.querySelector('.collapse-arrow') : null;

            // Add click handler to header
            if (header) {
                header.addEventListener('click', function () {
                    toggleSection(sectionName);
                });
            }

            // Apply saved state (default to open if not saved)
            const isOpen = savedState[sectionName] !== false; // Default to true
            if (content) {
                content.style.display = isOpen ? '' : 'none';
            }
            if (arrow) {
                arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
        });
    }

    // Initialize accordion after form is ready
    initializeAccordion();

    // Function to update camera values in the form
    function updateCameraInputs() {
        if (camera) {
            // Update FOV, near, far
            const fovInput = form.querySelector('input[name="cameraFov"]');
            const nearInput = form.querySelector('input[name="cameraNear"]');
            const farInput = form.querySelector('input[name="cameraFar"]');

            if (fovInput && camera.fov !== undefined) fovInput.value = camera.fov.toFixed(1);
            if (nearInput) nearInput.value = camera.near.toFixed(2);
            if (farInput) farInput.value = camera.far.toFixed(0);

            // Update position
            const posXInput = form.querySelector('input[name="cameraPositionX"]');
            const posYInput = form.querySelector('input[name="cameraPositionY"]');
            const posZInput = form.querySelector('input[name="cameraPositionZ"]');

            if (posXInput) posXInput.value = camera.position.x.toFixed(2);
            if (posYInput) posYInput.value = camera.position.y.toFixed(2);
            if (posZInput) posZInput.value = camera.position.z.toFixed(2);

            // Update rotation (convert radians to degrees)
            const rotXInput = form.querySelector('input[name="cameraRotationX"]');
            const rotYInput = form.querySelector('input[name="cameraRotationY"]');
            const rotZInput = form.querySelector('input[name="cameraRotationZ"]');

            if (rotXInput) rotXInput.value = (camera.rotation.x * 180 / Math.PI).toFixed(2);
            if (rotYInput) rotYInput.value = (camera.rotation.y * 180 / Math.PI).toFixed(2);
            if (rotZInput) rotZInput.value = (camera.rotation.z * 180 / Math.PI).toFixed(2);
        }
    }

    // Continuous update loop for camera inputs while modal is open
    let cameraUpdateAnimationId = null;
    let isModalOpen = false;

    function continuousUpdateCameraInputs() {
        if (isModalOpen) {
            updateCameraInputs();
            cameraUpdateAnimationId = requestAnimationFrame(continuousUpdateCameraInputs);
        }
    }

    // Event handlers
    settingsButton.addEventListener('click', function () {
        // Mark modal as open and start continuous updates
        isModalOpen = true;
        updateCameraInputs();
        continuousUpdateCameraInputs();

        modalOverlay.style.display = 'block';
        // Trigger slide-in animation after display is set
        setTimeout(function () {
            modalContent.style.transform = 'translateX(0)';
        }, 10);
    });

    const closeButton = form.querySelector('#closeModal');
    closeButton.addEventListener('click', function () {
        closePanel();
    });

    const closeButtonHeader = form.querySelector('#closeModalHeader');
    closeButtonHeader.addEventListener('click', function () {
        closePanel();
    });

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closePanel();
        }
    });

    function closePanel() {
        // Stop continuous camera updates
        isModalOpen = false;
        if (cameraUpdateAnimationId !== null) {
            cancelAnimationFrame(cameraUpdateAnimationId);
            cameraUpdateAnimationId = null;
        }

        // Slide out animation
        modalContent.style.transform = 'translateX(100%)';
        // Hide overlay after animation completes
        setTimeout(function () {
            modalOverlay.style.display = 'none';
            // Return focus to renderer for keyboard controls
            if (renderer && renderer.domElement) {
                renderer.domElement.focus();
            }
        }, 300);
    }

    // Color picker synchronization
    const bgColorText = document.getElementById('bgColorText');
    const bgColorPicker = document.getElementById('bgColorPicker');
    const fogColorText = document.getElementById('fogColorText');
    const fogColorPicker = document.getElementById('fogColorPicker');

    // Helper function to convert color to hex format
    function toHexColor(colorStr) {
        if (!colorStr || colorStr.trim() === '') return null;

        try {
            // Handle 0x format
            if (colorStr.startsWith('0x')) {
                return '#' + colorStr.substring(2);
            }
            // Already hex
            if (colorStr.startsWith('#')) {
                return colorStr;
            }
            // Try creating THREE.Color to convert
            const color = new THREE.Color(colorStr);
            return '#' + color.getHexString();
        } catch (e) {
            return null;
        }
    }

    // Background color synchronization
    if (bgColorPicker && bgColorText) {
        bgColorPicker.addEventListener('input', function () {
            bgColorText.value = this.value;
            // Trigger change event on text input
            bgColorText.dispatchEvent(new Event('change', { bubbles: true }));
        });

        bgColorText.addEventListener('input', function () {
            const hexColor = toHexColor(this.value);
            if (hexColor) {
                bgColorPicker.value = hexColor;
            }
        });
    }

    // Fog color synchronization
    if (fogColorPicker && fogColorText) {
        fogColorPicker.addEventListener('input', function () {
            fogColorText.value = this.value;
            // Trigger change event on text input
            fogColorText.dispatchEvent(new Event('change', { bubbles: true }));
        });

        fogColorText.addEventListener('input', function () {
            const hexColor = toHexColor(this.value);
            if (hexColor) {
                fogColorPicker.value = hexColor;
            }
        });
    }

    // Fog type visibility control
    const fogTypeSelect = document.getElementById('fogTypeSelect');
    const fogColorContainer = document.getElementById('fogColorContainer');
    const fogNearContainer = document.getElementById('fogNearContainer');
    const fogFarContainer = document.getElementById('fogFarContainer');
    const fogDensityContainer = document.getElementById('fogDensityContainer');

    function updateFogVisibility() {
        const fogType = fogTypeSelect.value;

        if (!fogType || fogType === '') {
            // No fog - hide all fog controls
            fogColorContainer.style.display = 'none';
            fogNearContainer.style.display = 'none';
            fogFarContainer.style.display = 'none';
            fogDensityContainer.style.display = 'none';
        } else if (fogType === 'linear') {
            // Linear fog - show color, near, far
            fogColorContainer.style.display = 'block';
            fogNearContainer.style.display = 'block';
            fogFarContainer.style.display = 'block';
            fogDensityContainer.style.display = 'none';
        } else {
            // Exponential fog - show color and density
            fogColorContainer.style.display = 'block';
            fogNearContainer.style.display = 'none';
            fogFarContainer.style.display = 'none';
            fogDensityContainer.style.display = 'block';
        }
    }

    // Initialize fog visibility based on current selection
    if (fogTypeSelect) {
        updateFogVisibility();
        fogTypeSelect.addEventListener('change', updateFogVisibility);
    }

    // Controls type visibility control
    const controlsTypeSelect = document.getElementById('controlsTypeSelect');
    const orbitControlsSettings = document.getElementById('orbitControlsSettings');
    const trackballControlsSettings = document.getElementById('trackballControlsSettings');
    const flyControlsSettings = document.getElementById('flyControlsSettings');

    function updateControlsVisibility() {
        const controlsType = controlsTypeSelect.value;

        // Hide all control-specific settings first
        if (orbitControlsSettings) orbitControlsSettings.style.display = 'none';
        if (trackballControlsSettings) trackballControlsSettings.style.display = 'none';
        if (flyControlsSettings) flyControlsSettings.style.display = 'none';

        // Show relevant settings based on controls type
        if (controlsType === 'orbit' || controlsType === 'map') {
            if (orbitControlsSettings) orbitControlsSettings.style.display = 'block';
        } else if (controlsType === 'trackball') {
            if (trackballControlsSettings) trackballControlsSettings.style.display = 'block';
        } else if (controlsType === 'fly' || controlsType === 'firstperson') {
            if (flyControlsSettings) flyControlsSettings.style.display = 'block';
        }
        // Note: pointerlock, transform, drag, arcball don't have customizable settings in this UI
    }

    // Initialize controls visibility based on current selection
    if (controlsTypeSelect) {
        updateControlsVisibility();
        controlsTypeSelect.addEventListener('change', function () {
            updateControlsVisibility();
            // Also trigger real-time update for controls type change
            applySettingRealtime('controls', this.value);
        });
    }

    // Real-time update handlers for all form inputs
    const formInputs = form.querySelectorAll('input, select');
    formInputs.forEach(function (input) {
        input.addEventListener('change', function () {
            // For checkboxes, use checked property, otherwise use value
            const val = this.type === 'checkbox' ? String(this.checked) : this.value;
            applySettingRealtime(this.name, val);
        });

        // Also listen to input event for immediate feedback on text/number/search inputs
        if (input.type === 'text' || input.type === 'number' || input.type === 'search') {
            input.addEventListener('input', function () {
                applySettingRealtime(this.name, this.value);
            });
        }
    });

    // Special handler for cubeCamera checkbox to show warning
    const cubeCameraCheckbox = form.querySelector('input[name="cubeCamera"]');
    const cubeCameraWarning = document.getElementById('cubeCameraWarning');
    
    if (cubeCameraCheckbox && cubeCameraWarning) {
        // Get current applied state from URL
        const currentCubeCameraState = urlParams.get('cubeCamera') === 'true';
        
        // Function to check and update warning visibility
        function updateCubeCameraWarning() {
            const checkboxState = cubeCameraCheckbox.checked;
            const isDifferent = checkboxState !== currentCubeCameraState;
            
            if (isDifferent) {
                cubeCameraWarning.style.display = 'block';
            } else {
                cubeCameraWarning.style.display = 'none';
            }
        }
        
        // Check on change
        cubeCameraCheckbox.addEventListener('change', updateCubeCameraWarning);
        
        // Check on initial load
        updateCubeCameraWarning();
    }

    // Ground Material Selector - automatically sets both color and normal maps
    const groundMaterialSelect = form.querySelector('#groundMaterialSelect');
    if (groundMaterialSelect) {
        groundMaterialSelect.addEventListener('change', function () {
            const materialName = this.value;
            if (materialName && groundMaterialTextures[materialName]) {
                const ground = scene.getObjectByName('Ground');
                if (ground && ground.material) {
                    const materialConfig = groundMaterialTextures[materialName];
                    const loader = new THREE.TextureLoader(loadingManager);
                    const basePath = `assets/textures/${materialName}/2K/`;
                    
                    // Get current texture repeat value from form
                    const repeatInput = form.querySelector('input[name="ground_texture_repeat"]');
                    const repeatValue = repeatInput ? parseFloat(repeatInput.value) : 1;
                    const repeat = (!isNaN(repeatValue) && repeatValue > 0) ? repeatValue : 1;
                    
                    // Load color map
                    loader.load(basePath + materialConfig.color, function (texture) {
                        // Apply texture repeat
                        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                        texture.repeat.set(repeat, repeat);
                        
                        ground.material.map = texture;
                        ground.material.needsUpdate = true;
                        console.debug(`Loaded ground color map: ${basePath + materialConfig.color} with repeat: ${repeat}`);
                    });
                    
                    // Load normal map (if it exists)
                    if (materialConfig.normal) {
                        loader.load(basePath + materialConfig.normal, function (texture) {
                            // Apply texture repeat
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                            texture.repeat.set(repeat, repeat);
                            
                            ground.material.normalMap = texture;
                            ground.material.needsUpdate = true;
                            console.debug(`Loaded ground normal map: ${basePath + materialConfig.normal} with repeat: ${repeat}`);
                        });
                    } else {
                        // Material has no normal map
                        console.debug('Material has no normal map');
                    }
                }
            } else if (materialName === '') {
                // Clear textures when "None" is selected
                const ground = scene.getObjectByName('Ground');
                if (ground && ground.material) {
                    ground.material.map = null;
                    ground.material.normalMap = null;
                    ground.material.needsUpdate = true;
                    console.debug('Cleared ground textures');
                }
            }
        });
    }

    // Special handler for Camera Target input - search and target on keypress
    const targetInput = form.querySelector('input[name="target"]');
    if (targetInput) {
        targetInput.addEventListener('input', function () {
            const targetName = this.value.trim();

            if (targetName === '') {
                console.debug('Target name is empty');
                return;
            }

            // Search for the target object in the scene
            let targetObject = null;
            scene.traverse(function (child) {
                if (child.name === targetName) {
                    targetObject = child;
                }
            });

            if (targetObject) {
                console.debug('✓ Found target object:', targetName);

                // Only update if controls support targeting
                if (window.controls && window.controls.target) {
                    // Get the world position of the target
                    const worldPosition = new THREE.Vector3();
                    targetObject.getWorldPosition(worldPosition);

                    // Update controls target
                    window.controls.target.copy(worldPosition);

                    // Make camera look at the target
                    camera.lookAt(worldPosition);
                    camera.updateProjectionMatrix();

                    // Save the state so the target persists
                    if (window.controls.saveState) {
                        window.controls.saveState();
                    }

                    console.debug('Camera targeted on:', targetName, 'at position:', worldPosition);

                    // Visual feedback - change border color temporarily
                    this.style.borderColor = '#4a9eff';
                    setTimeout(() => {
                        this.style.borderColor = '#444';
                    }, 500);
                } else {
                    console.debug('Controls do not support targeting');
                }
            } else {
                console.debug('Object not found:', targetName);
                // Visual feedback - subtle red tint
                this.style.borderColor = '#663333';
            }
        });

        // Reset border on focus
        targetInput.addEventListener('focus', function () {
            this.style.borderColor = '#4a9eff';
        });

        targetInput.addEventListener('blur', function () {
            this.style.borderColor = '#444';
        });
    }

    function applySettingRealtime(name, value) {
        // Skip if value is empty (but allow 0 and false)
        if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
            console.debug('Skipping empty value for:', name);
            return;
        }

        console.debug('Real-time update:', name, '=', value);

        // Apply settings based on parameter name
        switch (name) {
            // Renderer settings
            case 'shadows':
                renderer.shadowMap.enabled = value === 'true';
                break;
            case 'shadowType':
                const shadowTypes = {
                    'basic': THREE.BasicShadowMap,
                    'pcf': THREE.PCFShadowMap,
                    'pcfsoft': THREE.PCFSoftShadowMap,
                    'vsm': THREE.VSMShadowMap
                };
                if (shadowTypes[value]) {
                    renderer.shadowMap.type = shadowTypes[value];
                }
                break;
            case 'toneMapping':
                const toneMappings = {
                    'none': THREE.NoToneMapping,
                    'linear': THREE.LinearToneMapping,
                    'reinhard': THREE.ReinhardToneMapping,
                    'cineon': THREE.CineonToneMapping,
                    'acesfilmic': THREE.ACESFilmicToneMapping
                };
                if (toneMappings[value]) {
                    renderer.toneMapping = toneMappings[value];
                }
                break;
            case 'toneMappingExposure':
                renderer.toneMappingExposure = parseFloat(value);
                break;

            // Camera settings
            case 'cameraFov':
                if (camera.fov !== undefined) {
                    camera.fov = parseFloat(value);
                    camera.updateProjectionMatrix();
                    console.debug('Camera FOV set to:', camera.fov);
                }
                break;
            case 'cameraNear':
                camera.near = parseFloat(value);
                camera.updateProjectionMatrix();
                console.debug('Camera near plane set to:', camera.near);
                break;
            case 'cameraFar':
                camera.far = parseFloat(value);
                camera.updateProjectionMatrix();
                console.debug('Camera far plane set to:', camera.far);
                break;
            case 'cameraPositionX':
                camera.position.x = parseFloat(value);
                console.debug('Camera position X set to:', camera.position.x);
                break;
            case 'cameraPositionY':
                camera.position.y = parseFloat(value);
                console.debug('Camera position Y set to:', camera.position.y);
                break;
            case 'cameraPositionZ':
                camera.position.z = parseFloat(value);
                console.debug('Camera position Z set to:', camera.position.z);
                break;
            case 'cameraRotationX':
                camera.rotation.x = parseFloat(value) * Math.PI / 180;
                console.debug('Camera rotation X set to:', value, 'degrees');
                break;
            case 'cameraRotationY':
                camera.rotation.y = parseFloat(value) * Math.PI / 180;
                console.debug('Camera rotation Y set to:', value, 'degrees');
                break;
            case 'cameraRotationZ':
                camera.rotation.z = parseFloat(value) * Math.PI / 180;
                console.debug('Camera rotation Z set to:', value, 'degrees');
                break;

            // Background settings
            case 'bgColor':
                let color;
                if (value.startsWith('0x')) {
                    color = new THREE.Color(parseInt(value, 16));
                } else {
                    color = new THREE.Color(value);
                }
                scene.background = color;
                
                // Create a simple environment map from the background color
                // This provides uniform lighting from all directions
                const pmremGenerator = new THREE.PMREMGenerator(renderer);
                const envScene = new THREE.Scene();
                envScene.background = color;
                const envMap = pmremGenerator.fromScene(envScene).texture;
                scene.environment = envMap;
                pmremGenerator.dispose();
                
                console.debug('Background color set with environment lighting:', color);
                break;
            case 'bgTexture':
                const textureLoader = new THREE.TextureLoader(loadingManager);
                textureLoader.load(value, function (texture) {
                    const urlParams = new URLSearchParams(window.location.search);
                    const is360 = urlParams.get('bg360') === 'true';
                    if (is360) {
                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        scene.background = texture;
                        scene.environment = texture;
                        console.debug('360° background texture loaded and set as environment');
                        
                        // Update all materials to show environment reflections
                        scene.traverse(function(child) {
                            if (child.isMesh && child.material) {
                                const material = child.material;
                                if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                    material.needsUpdate = true;
                                }
                            }
                        });
                    } else {
                        scene.background = texture;
                        scene.environment = null;
                        console.debug('Background texture loaded, environment cleared');
                    }
                });
                break;
            case 'bg360':
                // This requires reloading the texture and updating environment
                if (scene.background && scene.background.isTexture) {
                    if (value === 'true') {
                        scene.background.mapping = THREE.EquirectangularReflectionMapping;
                        scene.environment = scene.background;
                        console.debug('360° mode enabled, environment set');
                        
                        // Update all materials to show environment reflections
                        scene.traverse(function(child) {
                            if (child.isMesh && child.material) {
                                const material = child.material;
                                if (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial) {
                                    material.needsUpdate = true;
                                }
                            }
                        });
                    } else {
                        scene.background.mapping = THREE.Texture.DEFAULT_MAPPING;
                        scene.environment = null;
                        console.debug('360° mode disabled, environment cleared');
                    }
                }
                break;
            case 'bgColorSpace':
                if (scene.background && scene.background.isTexture) {
                    if (value === 'srgb') {
                        scene.background.colorSpace = THREE.SRGBColorSpace;
                    } else if (value === 'linear') {
                        scene.background.colorSpace = THREE.LinearSRGBColorSpace;
                    }
                    scene.background.needsUpdate = true;
                }
                break;

            // Fog settings
            case 'fogType':
                if (value === 'none' || value === '') {
                    scene.fog = null;
                } else {
                    const urlParams = new URLSearchParams(window.location.search);
                    const fogColor = urlParams.get('fogColor') || '0xcccccc';
                    let color;
                    if (fogColor.startsWith('0x')) {
                        color = parseInt(fogColor, 16);
                    } else {
                        color = new THREE.Color(fogColor);
                    }

                    if (value === 'linear') {
                        const fogNear = parseFloat(urlParams.get('fogNear') || '1');
                        const fogFar = parseFloat(urlParams.get('fogFar') || '1000');
                        scene.fog = new THREE.Fog(color, fogNear, fogFar);
                    } else if (value === 'exp' || value === 'exp2') {
                        const fogDensity = parseFloat(urlParams.get('fogDensity') || '0.00025');
                        scene.fog = new THREE.FogExp2(color, fogDensity);
                    }
                }
                break;
            case 'fogColor':
                if (scene.fog) {
                    let color;
                    if (value.startsWith('0x')) {
                        color = new THREE.Color(parseInt(value, 16));
                    } else {
                        color = new THREE.Color(value);
                    }
                    scene.fog.color = color;
                }
                break;
            case 'fogNear':
                if (scene.fog && scene.fog.isFog) {
                    scene.fog.near = parseFloat(value);
                }
                break;
            case 'fogFar':
                if (scene.fog && scene.fog.isFog) {
                    scene.fog.far = parseFloat(value);
                }
                break;
            case 'fogDensity':
                if (scene.fog && scene.fog.isFogExp2) {
                    scene.fog.density = parseFloat(value);
                }
                break;

            // Ground settings - find ground object in scene
            case 'ground_enabled':
                const groundEnabled = scene.getObjectByName('Ground');
                if (groundEnabled) {
                    groundEnabled.visible = (value === 'true');
                    console.debug('Ground visibility set to:', value === 'true');
                }
                break;
            case 'ground_radius':
                const groundObj = scene.getObjectByName('Ground');
                if (groundObj && groundObj.geometry) {
                    const radius = parseFloat(value);
                    const segments = groundObj.geometry.parameters.widthSegments || 32;
                    groundObj.geometry.dispose();
                    groundObj.geometry = new THREE.CircleGeometry(radius, segments);
                }
                break;
            case 'ground_position_x':
                const groundPosX = scene.getObjectByName('Ground');
                if (groundPosX) groundPosX.position.x = parseFloat(value);
                break;
            case 'ground_position_y':
                const groundPosY = scene.getObjectByName('Ground');
                if (groundPosY) groundPosY.position.y = parseFloat(value);
                break;
            case 'ground_position_z':
                const groundPosZ = scene.getObjectByName('Ground');
                if (groundPosZ) groundPosZ.position.z = parseFloat(value);
                break;
            case 'ground_rotation_x':
                const groundRotX = scene.getObjectByName('Ground');
                if (groundRotX) groundRotX.rotation.x = parseFloat(value) * Math.PI / 180;
                break;
            case 'ground_rotation_y':
                const groundRotY = scene.getObjectByName('Ground');
                if (groundRotY) groundRotY.rotation.y = parseFloat(value) * Math.PI / 180;
                break;
            case 'ground_rotation_z':
                const groundRotZ = scene.getObjectByName('Ground');
                if (groundRotZ) groundRotZ.rotation.z = parseFloat(value) * Math.PI / 180;
                break;
            case 'ground_roughness':
                const groundRough = scene.getObjectByName('Ground');
                if (groundRough && groundRough.material) {
                    groundRough.material.roughness = parseFloat(value);
                    groundRough.material.needsUpdate = true;
                }
                break;
            case 'ground_metalness':
                const groundMetal = scene.getObjectByName('Ground');
                if (groundMetal && groundMetal.material) {
                    groundMetal.material.metalness = parseFloat(value);
                    groundMetal.material.needsUpdate = true;
                }
                break;
            case 'ground_opacity':
                const groundOpac = scene.getObjectByName('Ground');
                if (groundOpac && groundOpac.material) {
                    groundOpac.material.opacity = parseFloat(value);
                    groundOpac.material.needsUpdate = true;
                }
                break;
            case 'ground_side':
                const groundSide = scene.getObjectByName('Ground');
                if (groundSide && groundSide.material) {
                    const sideMap = {
                        'front': THREE.FrontSide,
                        'back': THREE.BackSide,
                        'double': THREE.DoubleSide
                    };
                    if (sideMap[value]) {
                        groundSide.material.side = sideMap[value];
                        groundSide.material.needsUpdate = true;
                    }
                }
                break;
            case 'ground_blending':
                const groundBlend = scene.getObjectByName('Ground');
                if (groundBlend && groundBlend.material) {
                    const blendingMap = {
                        'normal': THREE.NormalBlending,
                        'additive': THREE.AdditiveBlending,
                        'subtractive': THREE.SubtractiveBlending,
                        'multiply': THREE.MultiplyBlending
                    };
                    if (blendingMap[value]) {
                        groundBlend.material.blending = blendingMap[value];
                        groundBlend.material.needsUpdate = true;
                    }
                }
                break;
            case 'ground_transparent':
                const groundTrans = scene.getObjectByName('Ground');
                if (groundTrans && groundTrans.material) {
                    groundTrans.material.transparent = (value === 'true');
                    groundTrans.material.needsUpdate = true;
                }
                break;
            case 'ground_material':
                const ground = scene.getObjectByName('Ground');
                if (ground && ground.material && value) {
                    const materialConfig = groundMaterialTextures[value];
                    if (materialConfig) {
                        const loader = new THREE.TextureLoader(loadingManager);
                        const basePath = `assets/textures/${value}/2K/`;
                        
                        // Get current texture repeat value from URL params
                        const repeatValue = parseFloat(urlParams.get('ground_texture_repeat')) || 1;
                        const repeat = (!isNaN(repeatValue) && repeatValue > 0) ? repeatValue : 1;
                        
                        // Load color map
                        loader.load(basePath + materialConfig.color, function (texture) {
                            // Apply texture repeat
                            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                            texture.repeat.set(repeat, repeat);
                            
                            ground.material.map = texture;
                            ground.material.needsUpdate = true;
                            console.debug(`Loaded ground color map: ${basePath + materialConfig.color} with repeat: ${repeat}`);
                        });
                        
                        // Load normal map (if it exists)
                        if (materialConfig.normal) {
                            loader.load(basePath + materialConfig.normal, function (texture) {
                                // Apply texture repeat
                                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                                texture.repeat.set(repeat, repeat);
                                
                                ground.material.normalMap = texture;
                                ground.material.needsUpdate = true;
                                console.debug(`Loaded ground normal map: ${basePath + materialConfig.normal} with repeat: ${repeat}`);
                            });
                        } else {
                            // Material has no normal map
                            console.debug('Material has no normal map');
                        }
                    }
                }
                break;
            case 'ground_map':
                const groundMap = scene.getObjectByName('Ground');
                if (groundMap && groundMap.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundMap.material.map = texture;
                        groundMap.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_normal_map':
                const groundNormal = scene.getObjectByName('Ground');
                if (groundNormal && groundNormal.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundNormal.material.normalMap = texture;
                        groundNormal.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_rough_map':
                const groundRoughMap = scene.getObjectByName('Ground');
                if (groundRoughMap && groundRoughMap.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundRoughMap.material.roughnessMap = texture;
                        groundRoughMap.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_metal_map':
                const groundMetalMap = scene.getObjectByName('Ground');
                if (groundMetalMap && groundMetalMap.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundMetalMap.material.metalnessMap = texture;
                        groundMetalMap.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_ao_map':
                const groundAO = scene.getObjectByName('Ground');
                if (groundAO && groundAO.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundAO.material.aoMap = texture;
                        groundAO.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_env_map':
                const groundEnv = scene.getObjectByName('Ground');
                if (groundEnv && groundEnv.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundEnv.material.envMap = texture;
                        groundEnv.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_light_map':
                const groundLight = scene.getObjectByName('Ground');
                if (groundLight && groundLight.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundLight.material.lightMap = texture;
                        groundLight.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_emissive_map':
                const groundEmissive = scene.getObjectByName('Ground');
                if (groundEmissive && groundEmissive.material) {
                    const loader = new THREE.TextureLoader(loadingManager);
                    loader.load(value, function (texture) {
                        groundEmissive.material.emissiveMap = texture;
                        groundEmissive.material.needsUpdate = true;
                    });
                }
                break;
            case 'ground_texture_repeat':
                const groundRepeat = scene.getObjectByName('Ground');
                if (groundRepeat && groundRepeat.material) {
                    const repeat = parseFloat(value);
                    if (!isNaN(repeat) && repeat > 0) {
                        // Update color map repeat
                        if (groundRepeat.material.map) {
                            groundRepeat.material.map.wrapS = groundRepeat.material.map.wrapT = THREE.RepeatWrapping;
                            groundRepeat.material.map.repeat.set(repeat, repeat);
                            groundRepeat.material.map.needsUpdate = true;
                        }
                        // Update normal map repeat
                        if (groundRepeat.material.normalMap) {
                            groundRepeat.material.normalMap.wrapS = groundRepeat.material.normalMap.wrapT = THREE.RepeatWrapping;
                            groundRepeat.material.normalMap.repeat.set(repeat, repeat);
                            groundRepeat.material.normalMap.needsUpdate = true;
                        }
                        groundRepeat.material.needsUpdate = true;
                        console.debug('Ground texture repeat updated:', repeat);
                    }
                }
                break;

            // Target Object settings
            case 'target_glb':
                // GLB loading requires reload - handled by initial scene load
                console.debug('Target GLB URL changed - requires page reload');
                break;
            case 'target_position_x':
                const targetPosX = scene.getObjectByName('Target');
                if (targetPosX) {
                    targetPosX.position.x = parseFloat(value);
                }
                break;
            case 'target_position_y':
                const targetPosY = scene.getObjectByName('Target');
                if (targetPosY) {
                    targetPosY.position.y = parseFloat(value);
                }
                break;
            case 'target_position_z':
                const targetPosZ = scene.getObjectByName('Target');
                if (targetPosZ) {
                    targetPosZ.position.z = parseFloat(value);
                }
                break;
            case 'target_rotation_x':
                const targetRotX = scene.getObjectByName('Target');
                if (targetRotX) {
                    targetRotX.rotation.x = parseFloat(value) * Math.PI / 180;
                }
                break;
            case 'target_rotation_y':
                const targetRotY = scene.getObjectByName('Target');
                if (targetRotY) {
                    targetRotY.rotation.y = parseFloat(value) * Math.PI / 180;
                }
                break;
            case 'target_rotation_z':
                const targetRotZ = scene.getObjectByName('Target');
                if (targetRotZ) {
                    targetRotZ.rotation.z = parseFloat(value) * Math.PI / 180;
                }
                break;
            case 'target_scale_x':
                const targetScaleX = scene.getObjectByName('Target');
                if (targetScaleX) {
                    targetScaleX.scale.x = parseFloat(value);
                }
                break;
            case 'target_scale_y':
                const targetScaleY = scene.getObjectByName('Target');
                if (targetScaleY) {
                    targetScaleY.scale.y = parseFloat(value);
                }
                break;
            case 'target_scale_z':
                const targetScaleZ = scene.getObjectByName('Target');
                if (targetScaleZ) {
                    targetScaleZ.scale.z = parseFloat(value);
                }
                break;

            // Controls settings - dynamically switch controls
            case 'controls':
                // Dispose of old controls if they exist
                if (window.controls) {
                    if (window.controls.dispose) {
                        window.controls.dispose();
                    }
                    window.controls = null;
                }

                // Map of available controls
                const controlsMap = {
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

                // Initialize the new controls
                const NewControlsClass = controlsMap[value.toLowerCase()];
                if (NewControlsClass) {
                    // Special handling for DragControls which requires objects array
                    if (value.toLowerCase() === 'drag') {
                        window.controls = new NewControlsClass(scene.children, camera, renderer.domElement);
                    } else {
                        window.controls = new NewControlsClass(camera, renderer.domElement);
                    }

                    // Enable the controls
                    if (window.controls.enabled !== undefined) {
                        window.controls.enabled = true;
                    }

                    // Make sure renderer domElement can receive keyboard focus
                    if (renderer && renderer.domElement) {
                        if (!renderer.domElement.hasAttribute('tabindex')) {
                            renderer.domElement.setAttribute('tabindex', '0');
                        }
                        // Focus the element so keyboard events are captured
                        renderer.domElement.focus();
                    }

                    // Setup camera target if controls support it
                    if (window.controls && window.controls.target) {
                        const urlParams = new URLSearchParams(window.location.search);
                        const targetName = urlParams.get('target') || 'Target';
                        let targetObject = null;

                        // Search for the target object in the scene
                        scene.traverse(function (child) {
                            if (child.name === targetName) {
                                targetObject = child;
                            }
                        });

                        // If custom target wasn't found and we're not looking for default, try "Target"
                        if (!targetObject && urlParams.get('target') !== null) {
                            scene.traverse(function (child) {
                                if (child.name === 'Target') {
                                    targetObject = child;
                                }
                            });
                        }

                        // Set the target if found
                        if (targetObject) {
                            const worldPosition = new THREE.Vector3();
                            targetObject.getWorldPosition(worldPosition);
                            window.controls.target.copy(worldPosition);
                            camera.lookAt(worldPosition);
                            camera.updateProjectionMatrix();

                            if (window.controls.saveState) {
                                window.controls.saveState();
                            }
                        }
                    }

                    // Apply settings from form for the new controls type
                    const formInputs = document.querySelectorAll('#sceneSettingsForm input, #sceneSettingsForm select');
                    formInputs.forEach(function (input) {
                        if (input.name && input.value && input.value.trim() !== '') {
                            // Apply control-specific settings
                            const controlProps = ['minDistance', 'maxDistance', 'minPolarAngle', 'maxPolarAngle',
                                'minAzimuthAngle', 'maxAzimuthAngle', 'dampingFactor', 'enableDamping',
                                'enablePan', 'enableZoom', 'enableRotate', 'autoRotate', 'autoRotateSpeed',
                                'rotateSpeed', 'zoomSpeed', 'panSpeed', 'staticMoving',
                                'movementSpeed', 'rollSpeed', 'dragToLook'];

                            if (controlProps.includes(input.name)) {
                                applySettingRealtime(input.name, input.value);
                            }
                        }
                    });

                    console.debug('Controls switched to:', value);
                }
                break;
            case 'target':
                // Changing target requires reloading the page
                console.debug('Target change requires form submission');
                break;
            case 'minDistance':
                if (window.controls) {
                    console.debug('Controls type:', window.controls.constructor.name);
                    if (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls') {
                        window.controls.minDistance = parseFloat(value);
                        console.debug('Set minDistance to:', window.controls.minDistance);
                    } else {
                        console.debug('minDistance not applicable to', window.controls.constructor.name);
                    }
                } else {
                    console.debug('No controls found!');
                }
                break;
            case 'maxDistance':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.maxDistance = parseFloat(value);
                    console.debug('Set maxDistance to:', window.controls.maxDistance);
                }
                break;
            case 'minPolarAngle':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.minPolarAngle = parseFloat(value) * Math.PI / 180;
                    console.debug('Set minPolarAngle to:', value, 'degrees (', window.controls.minPolarAngle, 'radians)');
                }
                break;
            case 'maxPolarAngle':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.maxPolarAngle = parseFloat(value) * Math.PI / 180;
                    console.debug('Set maxPolarAngle to:', value, 'degrees (', window.controls.maxPolarAngle, 'radians)');
                }
                break;
            case 'minAzimuthAngle':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.minAzimuthAngle = parseFloat(value) * Math.PI / 180;
                }
                break;
            case 'maxAzimuthAngle':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.maxAzimuthAngle = parseFloat(value) * Math.PI / 180;
                }
                break;
            case 'dampingFactor':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.dampingFactor = parseFloat(value);
                }
                break;
            case 'enableDamping':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.enableDamping = (value === 'true');
                }
                break;
            case 'enablePan':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.enablePan = (value === 'true');
                }
                break;
            case 'enableZoom':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.enableZoom = (value === 'true');
                }
                break;
            case 'enableRotate':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.enableRotate = (value === 'true');
                }
                break;
            case 'autoRotate':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.autoRotate = (value === 'true');
                }
                break;
            case 'autoRotateSpeed':
                if (window.controls && (window.controls.constructor.name === 'OrbitControls' || window.controls.constructor.name === 'MapControls')) {
                    window.controls.autoRotateSpeed = parseFloat(value);
                }
                break;
            case 'rotateSpeed':
                if (window.controls) {
                    if (window.controls.constructor.name === 'TrackballControls') {
                        window.controls.rotateSpeed = parseFloat(value);
                    }
                }
                break;
            case 'zoomSpeed':
                if (window.controls) {
                    if (window.controls.constructor.name === 'TrackballControls') {
                        window.controls.zoomSpeed = parseFloat(value);
                    }
                }
                break;
            case 'panSpeed':
                if (window.controls) {
                    if (window.controls.constructor.name === 'TrackballControls') {
                        window.controls.panSpeed = parseFloat(value);
                    }
                }
                break;
            case 'staticMoving':
                if (window.controls && window.controls.constructor.name === 'TrackballControls') {
                    window.controls.staticMoving = (value === 'true');
                }
                break;
            case 'movementSpeed':
                if (window.controls && (window.controls.constructor.name === 'FlyControls' || window.controls.constructor.name === 'FirstPersonControls')) {
                    window.controls.movementSpeed = parseFloat(value);
                }
                break;
            case 'rollSpeed':
                if (window.controls && (window.controls.constructor.name === 'FlyControls' || window.controls.constructor.name === 'FirstPersonControls')) {
                    window.controls.rollSpeed = parseFloat(value);
                }
                break;
            case 'dragToLook':
                if (window.controls && (window.controls.constructor.name === 'FlyControls' || window.controls.constructor.name === 'FirstPersonControls')) {
                    window.controls.dragToLook = (value === 'true');
                }
                break;

            // Mouse enabled/disabled
            case 'mouseEnabled':
                if (window.controls) {
                    const isEnabled = (value === 'true');
                    // Enable or disable mouse events on the controls
                    if (isEnabled) {
                        window.controls.enabled = true;
                    } else {
                        window.controls.enabled = false;
                    }
                }
                break;

            // CubeCamera settings
            case 'cubeCamera':
                const enableCubeCamera = (value === 'true');
                if (enableCubeCamera && !window.cubeCamera) {
                    // Enable CubeCamera - need to reload for full initialization
                    // Warning is shown in UI, no console debug needed
                } else if (!enableCubeCamera && window.cubeCamera) {
                    // Disable CubeCamera by removing envMap from target
                    if (window.targetObject && window.targetObject.material) {
                        window.targetObject.material.envMap = null;
                        window.targetObject.material.needsUpdate = true;
                        console.debug('CubeCamera disabled, envMap removed');
                    }
                } else if (enableCubeCamera && window.cubeCamera) {
                    // Re-enable if it was disabled
                    if (window.targetObject && window.targetObject.material && window.cubeCamera) {
                        window.targetObject.material.envMap = window.cubeCamera.renderTarget.texture;
                        window.targetObject.material.needsUpdate = true;
                        console.debug('CubeCamera re-enabled');
                    }
                }
                break;
                
            case 'envMapIntensity':
                if (window.targetObject && window.targetObject.material) {
                    window.targetObject.material.envMapIntensity = parseFloat(value);
                    window.targetObject.material.needsUpdate = true;
                    console.debug('Environment map intensity set to:', value);
                }
                break;

            // Note: Light settings would require finding or creating light objects
            // For now, these would require a page reload via form submission
            default:
                // For light settings, we'll need to reload the page
                if (name.startsWith('ambient') || name.startsWith('directional') ||
                    name.startsWith('hemisphere') || name.startsWith('point') ||
                    name.startsWith('spot')) {
                    console.debug('Light settings require form submission to apply');
                }
                break;
        }
        
        // Update CubeCamera after any setting change (except camera position/rotation)
        // Camera position/rotation changes don't affect what the target reflects
        const cameraSettings = ['cameraPositionX', 'cameraPositionY', 'cameraPositionZ', 
                                'cameraRotationX', 'cameraRotationY', 'cameraRotationZ'];
        if (!cameraSettings.includes(name) && window.updateCubeCamera) {
            // Use LoadingManager to ensure textures are loaded before updating CubeCamera
            // If a texture is being loaded, the manager will handle it
            // Otherwise, update immediately
            if (loadingManager && loadingManager.itemsTotal === loadingManager.itemsLoaded) {
                // Nothing loading, update immediately
                window.updateCubeCamera();
                console.debug('CubeCamera updated after setting change:', name);
            } else {
                // Wait for loading to complete
                const onLoadComplete = function() {
                    window.updateCubeCamera();
                    console.debug('CubeCamera updated after loading:', name);
                    loadingManager.onLoad = null; // Clean up
                };
                if (loadingManager) {
                    loadingManager.onLoad = onLoadComplete;
                }
            }
        }
    }

    // Handle form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Build query string from form, excluding empty values
        const formData = new FormData(form);
        const params = new URLSearchParams();

        for (const [key, value] of formData.entries()) {
            // Only add non-empty values
            if (value && value.trim() !== '') {
                params.append(key, value);
            }
        }

        // Handle checkboxes explicitly (FormData doesn't include unchecked checkboxes)
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(function (checkbox) {
            if (checkbox.name) {
                // Always add checkbox state to params
                params.set(checkbox.name, String(checkbox.checked));
            }
        });

        // Reload page with new query string
        const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
        console.debug('Applying settings and reloading...', newUrl);
        window.location.href = newUrl;
    });
}

function stop() {
    // Cleanup UI elements
    const settingsButton = document.getElementById('settingsButton');
    const modal = document.getElementById('settingsModal');

    if (settingsButton) {
        settingsButton.remove();
    }

    if (modal) {
        modal.remove();
    }
}
