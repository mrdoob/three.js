*Inheritance: Lighting →*

# ClusteredLighting

A custom lighting implementation based on Forward+ Clustered Shading that overwrites the default lighting system in [WebGPURenderer](WebGPURenderer.html). Suitable for 3D scenes with many point and spot lights and real depth complexity — the view frustum is partitioned into a 3D cluster grid so only the lights actually reaching each fragment are evaluated.

## Code Example

```js
const lighting = new ClusteredLighting();
renderer.lighting = lighting; // set lighting system
```

## Import

ClusteredLighting is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { ClusteredLighting } from 'three/addons/lighting/ClusteredLighting.js';
```

## Constructor

### new ClusteredLighting( maxLights : number, tileSize : number, zSlices : number, maxLightsPerCluster : number )

Constructs a new clustered lighting system.

**maxLights**

Maximum number of point and spot lights.

Default is `1024`.

**tileSize**

Screen tile size in pixels (cluster XY size).

Default is `32`.

**zSlices**

Number of exponential depth slices.

Default is `24`.

**maxLightsPerCluster**

Per-cluster light-list capacity.

Default is `64`.

## Classes

[ClusteredLighting](ClusteredLighting.html)

## Methods

### .beginRender( scene : Scene )

Saves the lights of the scene's lights node and fits its cluster grid to the framebuffer of the render. This happens before any render object of the render is prepared, and the node of this depth is not used by any pending command buffer, so resources replaced by a rebuild are freed immediately.

**scene**

The scene.

**Overrides:** [Lighting#beginRender](Lighting.html#beginRender)

### .createNode( lights : Array.<Light> ) : ClusteredLightsNode

Creates a new clustered lights node for the given array of lights.

This method is called internally by the renderer and must be overwritten by all custom lighting implementations.

**lights**

The lights.

**Overrides:** [Lighting#createNode](Lighting.html#createNode)

**Returns:** The clustered lights node.

### .finishRender( scene : Scene )

Restores the lights of the scene's lights node.

**scene**

The scene.

**Overrides:** [Lighting#finishRender](Lighting.html#finishRender)

### .getNode( scene : Scene ) : LightsNode

Returns the lights node of the given scene for the current render depth of that scene. A scene rendered inside one of its own renders uses another node, so it never modifies the cluster data of the outer render, which has not been submitted yet.

**scene**

The scene.

**Overrides:** [Lighting#getNode](Lighting.html#getNode)

**Returns:** The lights node.

## Source

[examples/jsm/lighting/ClusteredLighting.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/ClusteredLighting.js)