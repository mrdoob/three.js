# Three.js DevTools Extension

This Chrome DevTools extension provides debugging capabilities for Three.js applications. It allows you to inspect scenes, objects, materials, and renderers, manipulate visibility, and monitor rendering performance.

## Installation

1. **Development Mode**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked" and select the `devtools` directory
   - The extension will now be available in Chrome DevTools when inspecting pages that use Three.js

2. **Usage**:
   - Open Chrome DevTools on a page using Three.js (F12 or Right-click > Inspect)
   - Click on the "Three.js" tab in DevTools
   - The panel will automatically detect and display Three.js scenes and renderers

## Code Flow Overview

### Extension Architecture

The extension follows a standard Chrome DevTools extension architecture:

1. **Background Script** (`background.js`): Manages the extension lifecycle and creates the DevTools panel
2. **DevTools Script** (`devtools.js`): Creates the panel when the DevTools window opens
3. **Content Script** (`content-script.js`): Injects the bridge into web pages and relays messages
4. **Injected Bridge** (`inject.js` → `bridge.js`): Creates the communication layer between Three.js and DevTools
5. **Panel UI** (`panel/*.js`, `panel/*.html`): The DevTools panel interface

### Initialization Flow

1. When a page loads, `content-script.js` injects `inject.js`
2. `inject.js` injects `bridge.js` into the page
3. `bridge.js` creates the `__THREE_DEVTOOLS__` global object
4. When Three.js loads, it detects this object and sends initialization events

### Bridge Operation (`bridge.js`)

The bridge acts as the communication layer between Three.js and the DevTools panel:

1. **Event Management**: Creates a custom event system to handle Three.js objects
   - Uses `DevToolsEventTarget` to manage event listeners and backlog events
   - Events include: `observe`, `update`, `remove`, `register`

2. **Object Tracking**:
   - `getObjectData()`: Extracts essential data from Three.js objects
   - Maintains a map of all observed objects (`devTools.objects`)
   - Automatically tracks scenes, objects, materials, and renderers

3. **Scene Observation**:
   - When Three.js sends an `observe` event for a scene, the bridge:
     - Records the scene in `__observed_scenes`
     - Traverses all child objects to populate the object hierarchy
     - Sets up monitoring to track changes

4. **Renderer Monitoring**:
   - For WebGLRenderer instances:
     - Tracks renderer properties, dimensions and draw calls
     - Updates statistics periodically
     - Extracts WebGL context information

5. **Message Handling**:
   - Listens for messages from the panel UI
   - Processes commands like visibility toggling and scene traversal

### Panel Interface (`panel/`)

The panel UI provides the visual representation of the Three.js objects:

1. **Tree View**: Displays hierarchical representation of scenes and objects
2. **Properties Panel**: Shows detailed properties of selected objects
3. **Performance Monitoring**: Displays renderer statistics and WebGL information

## Key Features

- **Scene Hierarchy Visualization**: Browse the complete scene graph
- **Object Inspection**: View mesh, material, and geometry properties
- **Visibility Control**: Toggle visibility of scene objects
- **Renderer Statistics**: Monitor draw calls, triangles, and memory usage
- **WebGL Information**: View context and capabilities information

## Communication Flow

1. **Three.js → Bridge**: Three.js detects the `__THREE_DEVTOOLS__` object and sends events
2. **Bridge → Content Script**: Bridge posts messages to window
3. **Content Script → DevTools Panel**: Content script relays messages to the DevTools panel
4. **DevTools Panel → Content Script**: Panel sends commands back via messaging
5. **Content Script → Bridge**: Content script relays commands to the bridge
6. **Bridge → Three.js**: Bridge manipulates Three.js objects directly

## Key Components

- **DevToolsEventTarget**: Custom event system with backlogging for async loading
- **Object Observation**: Tracks Three.js objects and their properties
- **Scene Monitoring**: Periodically checks for changes in observed scenes
- **WebGLRenderer Monitoring**: Tracks performance statistics for renderers
- **Visibility Toggle**: Allows showing/hiding objects in the scene

## Integration with Three.js

The extension relies on Three.js having built-in support for DevTools. When Three.js detects the presence of `window.__THREE_DEVTOOLS__`, it sends events about scenes, renderers, and other objects to the extension.

The bridge then processes these events, organizes the data, and provides a clean interface for the DevTools panel to display and interact with.

## Development

To modify the extension:

1. Edit the relevant files in the `devtools` directory
2. Reload the extension in `chrome://extensions/` by clicking the refresh icon
3. Reopen DevTools to see your changes