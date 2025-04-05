// Store the state of our inspector
const state = {
    revision: null,
    scenes: new Map(),
    renderers: new Map(),
    objects: new Map()
};

console.log('Panel script loaded');

// Create a connection to the background page
const backgroundPageConnection = chrome.runtime.connect({
    name: "three-devtools"
});

// Initialize the connection with the inspected tab ID
backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

console.log('Connected to background page with tab ID:', chrome.devtools.inspectedWindow.tabId);

// Store collapsed states
const collapsedSections = new Map();

// Initialize visibility state
let isVisible = true;

// Listen for visibility changes
document.addEventListener( 'visibilitychange', () => {

    isVisible = ! document.hidden;
    
    // Send visibility state to content script
    chrome.tabs.sendMessage( chrome.devtools.inspectedWindow.tabId, {
        name: 'visibility',
        value: isVisible
    } );

} );

// Initial visibility state
chrome.tabs.sendMessage( chrome.devtools.inspectedWindow.tabId, {
    name: 'visibility',
    value: isVisible
} );

// Clear state when panel is reloaded
function clearState() {
    state.revision = null;
    state.scenes.clear();
    state.renderers.clear();
    state.objects.clear();
    const container = document.getElementById('scene-tree');
    if (container) {
        container.innerHTML = '';
    }
}

// Listen for messages from the background page
backgroundPageConnection.onMessage.addListener(function (message) {
    console.log('Panel received message:', message);
    if (message.id === 'three-devtools') {
        handleThreeEvent(message);
    }
});

function handleThreeEvent(message) {
    console.log('Handling event:', message.type);
    switch (message.type) {
        case 'register':
            state.revision = message.detail.revision;
            updateUI();
            break;
        
        case 'observe':
            const detail = message.detail;
            console.log('Observed object:', detail);
            
            // Only store each unique object once
            if (!state.objects.has(detail.uuid)) {
                state.objects.set(detail.uuid, detail);
                
                if (detail.isRenderer) {
                    state.renderers.set(detail.uuid, detail);
                }
                else if (detail.isScene) {
                    state.scenes.set(detail.uuid, detail);
                }
                
                updateUI();
            }
            break;
            
        case 'update':
            const update = message.detail;
            if (update.type === 'WebGLRenderer') {
                console.log('Received renderer update:', {
                    uuid: update.uuid,
                    hasProperties: !!update.properties,
                    hasInfo: !!(update.properties && update.properties.info),
                    timestamp: new Date().toISOString()
                });
                const renderer = state.renderers.get(update.uuid);
                if (renderer) {
                    renderer.properties = update.properties;
                    updateRendererProperties(renderer);
                }
            }
            break;
            
        case 'committed':
            // Page was reloaded, clear state
            clearState();
            break;
    }
}

// Function to update just the renderer properties in the UI
function updateRendererProperties(renderer) {
    // Find the renderer's properties container
    const rendererElement = document.querySelector(`[data-uuid="${renderer.uuid}"]`);
    if (!rendererElement) return;

    const props = renderer.properties;
    
    // Update the renderer summary line
    const label = rendererElement.querySelector('.label');
    if (label) {
        let detailsText = '';
        const details = [`${props.width}x${props.height}`];
        if (props.info) {
            details.push(`${props.info.render.calls} calls`);
            details.push(`${props.info.render.triangles.toLocaleString()} tris`);
        }
        detailsText = `<span class="object-details">${details.join(' ・ ')}</span>`;
        label.innerHTML = `WebGLRenderer ${detailsText}`;
    }

    // Find or create properties container
    let propsContainer = rendererElement.nextElementSibling;
    if (!propsContainer || !propsContainer.classList.contains('properties-list')) {
        propsContainer = document.createElement('div');
        propsContainer.className = 'properties-list';
        propsContainer.style.paddingLeft = rendererElement.style.paddingLeft.replace('px', '') + 24 + 'px';
        rendererElement.parentNode.insertBefore(propsContainer, rendererElement.nextSibling);
    }
    
    // Store current collapse states before clearing
    const currentSections = propsContainer.querySelectorAll('details');
    currentSections.forEach(section => {
        const sectionKey = `${renderer.uuid}-${section.querySelector('summary').textContent}`;
        collapsedSections.set(sectionKey, !section.open);
    });
    
    // Clear existing properties
    propsContainer.innerHTML = '';

    // Create collapsible sections
    function createSection(title, properties) {
        const section = document.createElement('details');
        section.className = 'properties-section';
        
        // Check if this section was previously collapsed
        const sectionKey = `${renderer.uuid}-${title}`;
        const wasCollapsed = collapsedSections.get(sectionKey);
        // Start collapsed by default unless explicitly opened before
        section.open = wasCollapsed === undefined ? false : !wasCollapsed;

        const header = document.createElement('summary');
        header.className = 'properties-header';
        header.textContent = title;
        section.appendChild(header);

        // Add change listener to store collapse state
        section.addEventListener('toggle', () => {
            collapsedSections.set(sectionKey, !section.open);
        });

        properties.forEach(([name, value]) => {
            if (value !== undefined) {
                const propElem = document.createElement('div');
                propElem.className = 'property-item';
                propElem.innerHTML = `
                    <span class="property-name">${name}:</span>
                    <span class="property-value">${value}</span>
                `;
                section.appendChild(propElem);
            }
        });

        return section;
    }

    // Basic properties section
    const basicProps = [
        ['Size', `${props.width}x${props.height}`],
        ['Drawing Buffer', `${props.drawingBufferWidth}x${props.drawingBufferHeight}`],
        ['Alpha', props.alpha],
        ['Antialias', props.antialias],
        ['Output Color Space', props.outputColorSpace],
        ['Tone Mapping', props.toneMapping],
        ['Tone Mapping Exposure', props.toneMappingExposure],
        ['Shadows', props.shadowMapEnabled ? `enabled (${props.shadowMapType})` : 'disabled'],
        ['Auto Clear', props.autoClear],
        ['Auto Clear Color', props.autoClearColor],
        ['Auto Clear Depth', props.autoClearDepth],
        ['Auto Clear Stencil', props.autoClearStencil],
        ['Local Clipping', props.localClippingEnabled],
        ['Physically Correct Lights', props.physicallyCorrectLights]
    ];
    propsContainer.appendChild(createSection('Properties', basicProps));

    // Add real-time stats if available
    if (props.info) {
        // WebGL Info section
        if (props.info.webgl) {
            const webglInfo = [
                ['Version', props.info.webgl.version],
                ['GPU', props.info.webgl.gpu],
                ['Vendor', props.info.webgl.vendor],
                ['Max Textures', props.info.webgl.maxTextures],
                ['Max Attributes', props.info.webgl.maxAttributes],
                ['Max Texture Size', props.info.webgl.maxTextureSize],
                ['Max Cubemap Size', props.info.webgl.maxCubemapSize]
            ];
            propsContainer.appendChild(createSection('WebGL', webglInfo));
        }

        // Render info section
        const renderStats = [
            ['Frame', props.info.render.frame],
            ['Draw Calls', props.info.render.calls],
            ['Triangles', props.info.render.triangles.toLocaleString()],
            ['Points', props.info.render.points],
            ['Lines', props.info.render.lines],
            ['Sprites', props.info.render.sprites],
            ['Geometries', props.info.render.geometries]
        ];
        propsContainer.appendChild(createSection('Render Stats', renderStats));

        // Memory info section
        const memoryStats = [
            ['Geometries', props.info.memory.geometries],
            ['Textures', props.info.memory.textures],
            ['Shader Programs', props.info.memory.programs],
            ['Render Lists', props.info.memory.renderLists],
            ['Render Targets', props.info.memory.renderTargets]
        ];
        propsContainer.appendChild(createSection('Memory', memoryStats));
    }
}

// Function to get an object icon based on its type
function getObjectIcon(obj) {
    if (obj.isScene) return '🌍';
    if (obj.isRenderer) return '🎨';
    if (obj.isCamera) return '📷';
    if (obj.isLight) return '💡';
    if (obj.isMesh) return obj.materialType === 'MeshBasicMaterial' ? '⬜' : '🔷';
    if (obj.type === 'Group') return '📁';
    return '📦';
}

// Function to render an object and its children
function renderObject(obj, container, level = 0) {
    const elem = document.createElement('div');
    elem.className = 'tree-item';
    elem.style.paddingLeft = `${level * 20}px`;
    elem.setAttribute('data-uuid', obj.uuid);
    
    const icon = getObjectIcon(obj);
    let displayName = obj.name || obj.type;
    
    // Add renderer properties if available
    if (obj.isRenderer && obj.properties) {
        const props = obj.properties;
        const details = [`${props.width}x${props.height}`];
        if (props.info) {
            details.push(`${props.info.render.calls} calls`);
            details.push(`${props.info.render.triangles.toLocaleString()} tris`);
        }
        displayName = `WebGLRenderer <span class="object-details">${details.join(' ・ ')}</span>`;
    }
    
    // Add object count for scenes
    if (obj.isScene) {
        let objectCount = -1;
        // Count all descendants recursively
        function countObjects(uuid) {
            const object = state.objects.get(uuid);
            if (object) {
                objectCount++;
                if (object.children) {
                    object.children.forEach(childId => countObjects(childId));
                }
            }
        }
        countObjects(obj.uuid);
        displayName = `${displayName} <span class="object-details">${objectCount} objects</span>`;
    }
        
    elem.innerHTML = `
        <span class="icon">${icon}</span>
        <span class="label">${displayName}</span>
        <span class="type">${obj.type}</span>
    `;
    
    container.appendChild(elem);

    // Add renderer properties using the updateRendererProperties function
    if (obj.isRenderer && obj.properties) {
        updateRendererProperties(obj);
    }

    // Handle children
    if (obj.children && obj.children.length > 0) {
        // Create a container for children
        const childContainer = document.createElement('div');
        childContainer.className = 'children';
        container.appendChild(childContainer);

        // Get all children and sort them by type for better organization
        const children = obj.children
            .map(childId => state.objects.get(childId))
            .filter(child => child !== undefined)
            .sort((a, b) => {
                // Sort order: Cameras, Lights, Groups, Meshes, Others
                const typeOrder = {
                    isCamera: 1,
                    isLight: 2,
                    isGroup: 3,
                    isMesh: 4
                };
                const aOrder = Object.entries(typeOrder).find(([key]) => a[key])?.['1'] || 5;
                const bOrder = Object.entries(typeOrder).find(([key]) => b[key])?.['1'] || 5;
                return aOrder - bOrder;
            });

        // Render each child
        children.forEach(child => {
            renderObject(child, childContainer, level + 1);
        });
    }
}

// Function to update the UI
function updateUI() {
    console.log('Updating UI with state:', {
        revision: state.revision,
        scenesCount: state.scenes.size,
        renderersCount: state.renderers.size,
        objectsCount: state.objects.size
    });

    const container = document.getElementById('scene-tree');
    if (!container) {
        console.error('Could not find scene-tree container!');
        return;
    }
    container.innerHTML = '';

    // Add version info if available
    if (state.revision) {
        const versionInfo = document.createElement('div');
        versionInfo.className = 'info-item';
        versionInfo.textContent = `Three.js r${state.revision}`;
        container.appendChild(versionInfo);
    }

    // Add renderers section
    if (state.renderers.size > 0) {
        const renderersSection = document.createElement('div');
        renderersSection.className = 'section';
        renderersSection.innerHTML = '<h3>Renderers</h3>';
        
        state.renderers.forEach(renderer => {
            renderObject(renderer, renderersSection);
        });
        
        container.appendChild(renderersSection);
    }

    // Add scenes section
    if (state.scenes.size > 0) {
        const scenesSection = document.createElement('div');
        scenesSection.className = 'section';
        scenesSection.innerHTML = '<h3>Scenes</h3>';
        
        state.scenes.forEach(scene => {
            renderObject(scene, scenesSection);
        });
        
        container.appendChild(scenesSection);
    }
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    body {
        margin: 0;
        padding: 16px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12px;
        color: #333;
        background: #fff;
    }
    .info-item {
        padding: 8px 12px;
        background: #f5f5f5;
        border-radius: 4px;
        margin-bottom: 16px;
        font-family: monospace;
        color: #666;
    }
    .section {
        margin-bottom: 24px;
    }
    .section h3 {
        margin: 0 0 8px 0;
        font-size: 11px;
        text-transform: uppercase;
        color: #666;
        font-weight: 500;
        border-bottom: 1px solid #eee;
        padding-bottom: 4px;
    }
    .tree-item {
        display: flex;
        align-items: center;
        padding: 2px;
        cursor: pointer;
        border-radius: 4px;
    }
    .tree-item:hover {
        background: #e0e0e0;
    }
    .tree-item .icon {
        margin-right: 4px;
        opacity: 0.7;
    }
    .tree-item .label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .tree-item .label .object-details {
        color: #aaa;
        margin-left: 4px;
        font-weight: normal;
    }
    .tree-item .type {
        margin-left: 8px;
        opacity: 0.5;
        font-size: 0.9em;
    }
    .children {
        margin-left: 0;
    }
    
    .properties-list {
        font-family: monospace;
        font-size: 11px;
        margin: 4px 0;
        padding: 4px 0;
        border-left: 1px solid #eee;
    }
    
    .properties-section {
        margin-bottom: 8px;
    }
    
    .properties-header {
        color: #666;
        font-weight: bold;
        padding: 4px 0;
        cursor: pointer;
        user-select: none;
    }
    
    .properties-header:hover {
        background-color: #f5f5f5;
    }
    
    .property-item {
        padding: 2px 16px;
        display: flex;
        align-items: center;
    }
    
    .property-name {
        color: #666;
        margin-right: 8px;
        min-width: 120px;
    }
    
    .property-value {
        color: #333;
    }
    
    .visibility-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px 6px;
        font-size: 12px;
        opacity: 0.5;
        border-radius: 4px;
        margin-right: 4px;
    }
    
    .visibility-btn:hover {
        background: #e0e0e0;
        opacity: 1;
    }
    
    .tree-item:hover .visibility-btn {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Initial UI update
clearState();
updateUI();

// Function to send commands to the background script
function sendCommand(name, data = {}) {
    backgroundPageConnection.postMessage({
        name: name,
        ...data
    });
}