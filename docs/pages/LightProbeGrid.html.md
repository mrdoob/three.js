*Inheritance: EventDispatcher → Object3D → Light →*

# LightProbeGrid

A 3D grid of L2 Spherical Harmonic irradiance probes that provides position-dependent diffuse global illumination.

This is the [WebGPURenderer](WebGPURenderer.html) version of `LightProbeGrid`. The grid is a [Light](Light.html), so adding it to the scene applies its baked irradiance to every lit node material automatically. When using [WebGLRenderer](WebGLRenderer.html), import the grid from `LightProbeGridWebGL.js` instead.

The baked data is stored in a single RGBA `RenderTarget3D` atlas that packs the nine L2 SH coefficients into seven sub-volumes stacked along Z. Baking is fully GPU-resident: cubemap rendering, SH projection, and texture packing all happen on the GPU with zero CPU readback.

## Import

LightProbeGrid is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { LightProbeGrid } from 'three/addons/lighting/LightProbeGrid.js';
```

## Constructor

### new LightProbeGrid( width : number, height : number, depth : number, widthProbes : number, heightProbes : number, depthProbes : number )

Constructs a new irradiance probe grid.

The volume is centered at the object's position. It is split into one cell per probe, with each probe at the center of its cell, so the probes sit half a cell inside the volume.

**width**

Full width of the volume along X.

Default is `1`.

**height**

Full height of the volume along Y.

Default is `1`.

**depth**

Full depth of the volume along Z.

Default is `1`.

**widthProbes**

Number of probes along X. Defaults to `Math.max( 1, Math.round( width ) )`.

**heightProbes**

Number of probes along Y. Defaults to `Math.max( 1, Math.round( height ) )`.

**depthProbes**

Number of probes along Z. Defaults to `Math.max( 1, Math.round( depth ) )`.

## Properties

### .boundingBox : Box3

The world-space bounding box for the grid. This is the volume the grid lights, with the probes half a cell inside it. Updated automatically by [LightProbeGrid#bake](LightProbeGrid.html#bake).

### .depth : number

The full depth of the volume along Z.

### .height : number

The full height of the volume along Y.

### .isLightProbeGrid : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .priority : number

Where grids overlap, the grid with the highest priority lights the fragment. On ties, the most recently created grid wins.

Default is `0`.

### .resolution : Vector3

The number of probes along each axis.

### .texture : Data3DTexture

The single RGBA atlas 3D texture storing all seven packed SH sub-volumes stacked along Z.

### .width : number

The full width of the volume along X.

## Methods

### .bake( renderer : WebGPURenderer, scene : Scene, options : Object )

Bakes probes by rendering cubemaps at each probe position and projecting to L2 SH. Optionally iterates additional passes to capture indirect bounces: each extra pass samples the previous pass's data as indirect light, accumulating one bounce per extra pass.

Use `start` and `count` to bake a range and publish its cells immediately. Indices advance along X, then Z, then Y, filling horizontal layers from bottom to top. For incremental indirect bounces, finish the whole grid for `pass: 0`, then repeat with `pass: 1`, etc. Start each pass at index 0 to snapshot the previous pass before updating its cells.

Shadow-casting instances of `SunLight` are temporarily replaced with equivalent directional lights, since their view-fitted shadow cascades cannot be frozen across probe renders.

**renderer**

The renderer.

**scene**

The scene to render.

**options**

Bake options.

**cubemapSize**

Resolution of each cubemap face. Must be a multiple of 4.

Default is `8`.

**near**

Near plane for the cube camera.

Default is `0.1`.

**far**

Far plane for the cube camera.

Default is `100`.

**bounces**

Additional bounce passes. Only available when baking the whole grid.

Default is `0`.

**start**

Index of the first probe to bake.

Default is `0`.

**count**

Number of probes to bake. Defaults to the remaining probes.

**pass**

Starting pass. Zero captures direct light; later passes sample the previous pass. Ranged calls require `bounces: 0`.

Default is `0`.

### .dispose()

Frees GPU resources.

**Overrides:** [Light#dispose](Light.html#dispose)

### .getProbePosition( ix : number, iy : number, iz : number, target : Vector3 ) : Vector3

Returns the world-space position of the probe at grid indices (ix, iy, iz).

**ix**

X index.

**iy**

Y index.

**iz**

Z index.

**target**

The target vector.

**Returns:** The world-space position.

### .updateBoundingBox()

Updates the world-space bounding box from the current position and size.

## Source

[examples/jsm/lighting/LightProbeGrid.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/LightProbeGrid.js)