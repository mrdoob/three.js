# ShadowMapViewer

This is a helper for visualising a given light's shadow map. It works for shadow casting lights: DirectionalLight and SpotLight. It renders out the shadow map and displays it on a HUD.

This module can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), import the class from `ShadowMapViewerGPU.js`.

## Code Example

```js
const lightShadowMapViewer = new ShadowMapViewer( light );
lightShadowMapViewer.position.x = 10;
lightShadowMapViewer.position.y = SCREEN_HEIGHT - ( SHADOW_MAP_HEIGHT / 4 ) - 10;
lightShadowMapViewer.size.width = SHADOW_MAP_WIDTH / 4;
lightShadowMapViewer.size.height = SHADOW_MAP_HEIGHT / 4;
lightShadowMapViewer.update();
```

## Import

ShadowMapViewer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ShadowMapViewer } from 'three/addons/utils/ShadowMapViewer.js';
```

## Constructor

### new ShadowMapViewer( light : Light )

Constructs a new shadow map viewer.

**light**

The shadow casting light.

## Properties

### .enabled : boolean

Whether to display the shadow map viewer or not.

Default is `true`.

### .position : Object

The position of the viewer. When changing this property, make sure to call [ShadowMapViewer#update](ShadowMapViewer.html#update).

Default is `true`.

### .size : Object

The size of the viewer. When changing this property, make sure to call [ShadowMapViewer#update](ShadowMapViewer.html#update).

Default is `true`.

## Methods

### .render( renderer : WebGLRenderer )

Renders the viewer. This method must be called in the app's animation loop.

**renderer**

The renderer.

### .update()

Updates the viewer.

### .updateForWindowResize()

Resizes the viewer. This method should be called whenever the app's window is resized.

## Source

[examples/jsm/utils/ShadowMapViewer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/ShadowMapViewer.js)