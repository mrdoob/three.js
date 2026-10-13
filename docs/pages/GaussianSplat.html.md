*Inheritance: EventDispatcher → Object3D → Mesh →*

# GaussianSplat

A minimal renderer for 3D Gaussian splat geometry.

Note that this class can only be used with [WebGPURenderer](WebGPURenderer.html). The `forceWebGL` fallback of [WebGPURenderer](WebGPURenderer.html) is supported, but [WebGLRenderer](WebGLRenderer.html) is not. Import maps or package exports must resolve both `three/webgpu` and `three/tsl`.

## Code Example

```js
const splats = new GaussianSplat( geometry );
scene.add( splats );
```

## Import

GaussianSplat is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { GaussianSplat } from 'three/addons/objects/GaussianSplat.js';
```

## Constructor

### new GaussianSplat( splatGeometry : BufferGeometry, options : Object )

Constructs a new Gaussian splat mesh.

**splatGeometry**

The splat geometry to render. Higher-order spherical harmonics attributes must use packed `Uint32Array` words from [createGaussianSplatGeometry](global.html#createGaussianSplatGeometry) (`SH_BAND_WORDS[ degree ]` words per splat, four clamped-byte coefficients per word).

**options**

Options.

**autoSort**

Whether to sort automatically in `onBeforeRender`.

Default is `true`.

## Properties

### .autoSort : boolean

Whether to sort automatically in `onBeforeRender`.

### .boundingBox : Box3

The bounding box of the splats. Can be computed via [GaussianSplat#computeBoundingBox](GaussianSplat.html#computeBoundingBox).

Default is `null`.

### .boundingSphere : Sphere

The bounding sphere of the splats. Can be computed via [GaussianSplat#computeBoundingSphere](GaussianSplat.html#computeBoundingSphere).

Default is `null`.

### .isGaussianSplat : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .splatGeometry : BufferGeometry

The source splat geometry.

## Methods

### .computeBoundingBox()

Computes the bounding box of the splats, updating [GaussianSplat#boundingBox](GaussianSplat.html#boundingBox).

Each splat is expanded by its own extent rather than treated as a point, so the bounds cover what is drawn.

### .computeBoundingSphere()

Computes the bounding sphere of the splats, updating [GaussianSplat#boundingSphere](GaussianSplat.html#boundingSphere).

Each splat is expanded by its own extent rather than treated as a point, so the bounds cover what is drawn.

### .raycast( raycaster : Raycaster, intersects : Array.<Object> )

Computes intersection points between a casted ray and the splats.

**raycaster**

The raycaster.

**intersects**

The target array that holds the intersection points.

**Overrides:** [Mesh#raycast](Mesh.html#raycast)

### .updateSort( renderer : Renderer, camera : Camera ) : boolean

Updates the draw order if the camera or mesh orientation has changed enough to need a new sort.

**renderer**

The renderer.

**camera**

The camera used for rendering.

**Returns:** Whether a sort was dispatched this call.

### .updateSphericalHarmonics( renderer : Renderer, camera : Camera ) : boolean

Updates the view-dependent spherical harmonics colors if the camera or mesh transform has changed.

**renderer**

The renderer.

**camera**

The camera used for rendering.

**Returns:** Whether a compute pass was dispatched this call.

## Source

[examples/jsm/objects/GaussianSplat.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/GaussianSplat.js)