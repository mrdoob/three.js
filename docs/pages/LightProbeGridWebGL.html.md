# LightProbeGridWebGL

A 3D grid of L2 Spherical Harmonic irradiance probes that provides position-dependent diffuse global illumination.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). For [WebGPURenderer](WebGPURenderer.html), use [LightProbeGrid](LightProbeGrid.html).

All seven packed SH sub-volumes are stored in a **single** RGBA `WebGL3DRenderTarget` using a texture-atlas layout along the Z axis. Each sub-volume occupies `( nz + 2 )` atlas slices: one padding slice at each end (a copy of the nearest edge data slice) to prevent color bleeding when the hardware trilinear filter reads across a sub-volume boundary.

Atlas layout (nz = resolution.z, PADDING = 1):

Total atlas depth = `7 * ( nz + 2 )`.

Baking is fully GPU-resident: cubemap rendering, SH projection, and texture packing all happen on the GPU with zero CPU readback.

## Code Example

```js
slice   0              : padding  (copy of sub-volume 0, data slice 0)
  slices  1 … nz         : sub-volume 0 data
  slice   nz + 1         : padding  (copy of sub-volume 0, data slice nz-1)
  slice   nz + 2         : padding  (copy of sub-volume 1, data slice 0)
  slices  nz+3 … 2*nz+2  : sub-volume 1 data
  …
```

## Import

LightProbeGridWebGL is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { LightProbeGridWebGL } from 'three/addons/lighting/LightProbeGridWebGL.js';
```

## Constructor

### new LightProbeGridWebGL( width : number, height : number, depth : number, widthProbes : number, heightProbes : number, depthProbes : number )

Constructs a new irradiance probe grid.

The volume is centered at the object's position.

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

Number of probes along X. Defaults to `Math.max( 2, Math.round( width ) + 1 )`.

**heightProbes**

Number of probes along Y. Defaults to `Math.max( 2, Math.round( height ) + 1 )`.

**depthProbes**

Number of probes along Z. Defaults to `Math.max( 2, Math.round( depth ) + 1 )`.

## Properties

### .boundingBox : Box3

The world-space bounding box for the grid. Updated automatically by [LightProbeGridWebGL#bake](LightProbeGridWebGL.html#bake).

### .depth : number

The full depth of the volume along Z.

### .height : number

The full height of the volume along Y.

### .isLightProbeGrid : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .resolution : Vector3

The number of probes along each axis.

### .texture : Data3DTexture

The single RGBA atlas 3D texture storing all seven packed SH sub-volumes.

Default is `null`.

### .width : number

The full width of the volume along X.

## Methods

### .bake( renderer : WebGLRenderer, scene : Scene, options : Object )

Bakes probes by rendering cubemaps at each probe position and projecting to L2 SH. Optionally iterates additional passes to capture indirect bounces: each extra pass samples the previous pass's data as indirect light, so a grid added to the scene before baking accumulates one bounce per extra pass.

Use `start` and `count` to bake a range and publish its cells immediately. Indices advance along X, then Z, then Y, filling horizontal layers from bottom to top. For incremental indirect bounces, finish the whole grid for `pass: 0`, then repeat with `pass: 1`, etc. Start each pass at index 0 to snapshot the previous pass before updating its cells.

Shadow-casting instances of `SunLight` are temporarily replaced with equivalent directional lights, since their view-fitted shadow cascades cannot be frozen across probe renders.

**renderer**

The renderer.

**scene**

The scene to render.

**options**

Bake options.

**cubemapSize**

Resolution of each cubemap face.

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

[examples/jsm/lighting/LightProbeGridWebGL.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lighting/LightProbeGridWebGL.js)