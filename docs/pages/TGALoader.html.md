*Inheritance: Loader → DataTextureLoader →*

# TGALoader

A loader for the TGA texture format.

## Code Example

```js
const loader = new TGALoader();
const texture = await loader.loadAsync( 'textures/crate_color8.tga' );
texture.colorSpace = THREE.SRGBColorSpace; // only for color textures
```

## Import

TGALoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TGALoader } from 'three/addons/loaders/TGALoader.js';
```

## Constructor

### new TGALoader( manager : LoadingManager )

Constructs a new TGA loader.

**manager**

The loading manager.

## Methods

### .parse( buffer : ArrayBuffer ) : DataTextureLoader~TexData

Parses the given TGA texture data.

**buffer**

The raw texture data.

**Overrides:** [DataTextureLoader#parse](DataTextureLoader.html#parse)

**Returns:** An object representing the parsed texture data.

## Source

[examples/jsm/loaders/TGALoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/TGALoader.js)