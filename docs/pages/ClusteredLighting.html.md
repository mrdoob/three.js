*Inheritance: Lighting →*

# ClusteredLighting

A custom lighting implementation based on Forward+ Clustered Shading that overwrites the default lighting system in [WebGPURenderer](WebGPURenderer.html). Suitable for 3D scenes with many point lights and real depth complexity — the view frustum is partitioned into a 3D cluster grid so only the lights actually reaching each fragment are evaluated.

## Code Example

```js
const lighting = new ClusteredLighting();
renderer.lighting = lighting; // set lighting system
```

## Import

ClusteredLighting is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ClusteredLighting } from 'three/addons/lighting/ClusteredLighting.js';
```

## Constructor

### new ClusteredLighting( maxLights : number, tileSize : number, zSlices : number, maxLightsPerCluster : number )

Constructs a new clustered lighting system.

**maxLights**

Maximum number of point lights.

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

### .createNode( lights : Array.<Light> ) : ClusteredLightsNode

Creates a new clustered lights node for the given array of lights.

This method is called internally by the renderer and must be overwritten by all custom lighting implementations.

**lights**

The lights.

**Overrides:** [Lighting#createNode](Lighting.html#createNode)

**Returns:** The clustered lights node.

## Source

[examples/jsm/lighting/ClusteredLighting.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/ClusteredLighting.js)