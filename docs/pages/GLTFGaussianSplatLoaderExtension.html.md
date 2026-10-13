# GLTFGaussianSplatLoaderExtension

A glTF loader plugin for `KHR_gaussian_splatting`.

This plugin must be registered explicitly because [GaussianSplat](GaussianSplat.html) requires [WebGPURenderer](WebGPURenderer.html).

## Code Example

```js
const loader = new GLTFLoader();
loader.register( function ( parser ) {
	return new GLTFGaussianSplatLoaderExtension( parser );
} );
```

## Import

GLTFGaussianSplatLoaderExtension is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { GLTFGaussianSplatLoaderExtension } from 'three/addons/loaders/GLTFGaussianSplatLoaderExtension.js';
```

## Constructor

### new GLTFGaussianSplatLoaderExtension( parser : GLTFParser )

Constructs a new glTF gaussian splatting extension plugin.

**parser**

The glTF parser.

## Methods

### .loadMesh( meshIndex : number ) : Promise.<(Group|GaussianSplat)>

Loads a glTF mesh containing gaussian splat primitives.

**meshIndex**

The mesh index.

**Returns:** The loaded mesh or `null` when the mesh does not use this extension.

## Source

[examples/jsm/loaders/GLTFGaussianSplatLoaderExtension.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/GLTFGaussianSplatLoaderExtension.js)