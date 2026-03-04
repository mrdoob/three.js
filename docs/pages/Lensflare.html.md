*Inheritance: EventDispatcher → Object3D → Mesh →*

# Lensflare

Creates a simulated lens flare that tracks a light.

Note that this class can only be used with [WebGLRenderer](WebGLRenderer.html). When using [WebGPURenderer](WebGPURenderer.html), use [LensflareMesh](LensflareMesh.html).

## Code Example

```js
const light = new THREE.PointLight( 0xffffff, 1.5, 2000 );
const lensflare = new Lensflare();
lensflare.addElement( new LensflareElement( textureFlare0, 512, 0 ) );
lensflare.addElement( new LensflareElement( textureFlare1, 512, 0 ) );
lensflare.addElement( new LensflareElement( textureFlare2, 60, 0.6 ) );
light.add( lensflare );
```

## Import

Lensflare is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Lensflare } from 'three/addons/objects/Lensflare.js';
```

## Constructor

### new Lensflare()

Constructs a new lensflare.

## Properties

### .frustumCulled : boolean

Overwritten to disable view-frustum culling by default.

Default is `false`.

**Overrides:** [Mesh#frustumCulled](Mesh.html#frustumCulled)

### .isLensflare : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .renderOrder : number

Overwritten to make sure lensflares a rendered last.

Default is `Infinity`.

**Overrides:** [Mesh#renderOrder](Mesh.html#renderOrder)

## Methods

### .addElement( element : LensflareElement )

Adds the given lensflare element to this instance.

**element**

The element to add.

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

## Source

[examples/jsm/objects/Lensflare.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/objects/Lensflare.js)