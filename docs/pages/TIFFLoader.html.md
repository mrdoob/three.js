*Inheritance: Loader → DataTextureLoader →*

# TIFFLoader

A loader for the TIFF texture format.

## Code Example

```js
const loader = new TIFFLoader();
const texture = await loader.loadAsync( 'textures/tiff/crate_lzw.tif' );
texture.colorSpace = THREE.SRGBColorSpace;
```

## Import

TIFFLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TIFFLoader } from 'three/addons/loaders/TIFFLoader.js';
```

## Constructor

### new TIFFLoader( manager : LoadingManager )

Constructs a new TIFF loader.

**manager**

The loading manager.

## Methods

### .parse( buffer : ArrayBuffer ) : DataTextureLoader~TexData

Parses the given TIFF texture data.

**buffer**

The raw texture data.

**Overrides:** [DataTextureLoader#parse](DataTextureLoader.html#parse)

**Returns:** An object representing the parsed texture data.

## Source

[examples/jsm/loaders/TIFFLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/TIFFLoader.js)