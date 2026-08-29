# Three.js DevTools

A Chrome DevTools extension for inspecting three.js applications: the scene graph, the objects in it and the renderers drawing it.

## Installation

1. Open `chrome://extensions/` and enable "Developer mode".
2. Click "Load unpacked" and select this `devtools` directory.
3. Open DevTools on a page that uses three.js and select the "Three.js" tab.

The toolbar icon shows the three.js revision found on the page. Clicking it scrolls the page to the first canvas.

## Features

- **Scenes**: a collapsible tree of every scene and its objects, with geometry and material types for meshes, and object and light counts per scene.
- **Objects**: click an object to expand it: a preview of the object rendered with its own material, its position, rotation and scale, and a dropdown of properties for its geometry and each material. Hovering draws a box around it over the page.
- **Renderers**: properties, render stats and memory usage of every `WebGLRenderer` and `WebGPURenderer`, with a button to scroll to its canvas.

## How it works

three.js has built-in support for the extension: when `window.__THREE_DEVTOOLS__` exists, it dispatches a `register` event with its revision and an `observe` event for the objects it creates, of which the bridge picks the renderers and scenes.

### Files

- `manifest.json`: injects the page scripts into every frame at `document_start`.
- `bridge.js`: runs in the page's main world. Creates `window.__THREE_DEVTOOLS__`, collects data from the observed renderers and scenes, and answers the panel's requests.
- `highlight.js`: runs alongside the bridge. Draws a box around the hovered object in an overlay above the page, projected through the camera and viewport the scene is shown with (one per sub camera of an ArrayCamera).
- `preview.js`: runs alongside the bridge. Renders an expanded object with its own material, using a renderer created from the page's own three.js, lit by the page's environment and by studio lights of its own (the page's lights on WebGPU). Materials with custom shaders are skipped, their uniforms belong to the page's renderer.
- `content-script.js`: runs in the isolated world. Relays messages between the bridge and the background script.
- `background.js`: service worker. Routes messages between the panel and the content script of the inspected tab, and manages the toolbar badge.
- `devtools.js`: creates the "Three.js" panel.
- `panel/`: the panel UI. Keeps the state received from the bridge and renders it.
- `constants.js`: the message names, shared by every script except `content-script.js` (see Development).

### Message flow

```
three.js ──dispatchEvent──▶ bridge.js ──postMessage──▶ content-script.js ──runtime.sendMessage──▶ background.js ──port──▶ panel.js
                            bridge.js ◀──postMessage── content-script.js ◀──tabs.sendMessage──── background.js ◀──port── panel.js
```

The panel opens a port to the background script and identifies the inspected tab (`init`); the background script forwards its requests to that tab's content script.

Events from the page: `register`, `renderer`, `scene`, `scene-removed`, `object-details`. Requests from the panel: `request-state`, `request-object-details`, `scroll-to-canvas`, `highlight-object`, `unhighlight-object`.

### Views

The highlight and the preview need the renderer, camera and viewport a scene is shown with, which the bridge records in `scene.onAfterRender`. A scene is drawn many times a frame (shadow maps, reflections, post processing), so only a pass to the canvas, or to a texture shaped like it, counts, and since passes are seen as they finish, one rendered from inside another is followed by the pass it served. A pass to the canvas also records its viewport.

### State

The panel requests the state when it opens and then once a second, along with the details of the expanded objects. Rendering a preview costs the page a frame, so it is only asked for when a row is expanded and when its geometry or material changes. On each request the bridge resends every renderer (their stats change every frame), and a scene only when its object count changed. Scenes have no `dispose()`, so a scene that stays empty for several requests is removed from the panel, and brought back if it gains children again.

The background script tags every message with the frame it came from and reports navigations, so the panel drops the renderers and scenes of a navigated frame (all of them for a top-level navigation).

## Development

1. Edit the files in this directory.
2. Reload the extension in `chrome://extensions/`.
3. Close and reopen DevTools on the inspected page.

`bridge.js` and `content-script.js` run in different worlds of the same page and can't share a file: Chrome injects each file only once per frame, so `content-script.js` keeps its own copy of the message id.
