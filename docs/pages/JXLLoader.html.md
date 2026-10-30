*Inheritance: Loader →*

# JXLLoader

Loads HDR JPEG XL images using the browser's native decoder. Produces half-float textures in linear sRGB. Requires float16 Canvas2D, the srgb-linear canvas color space and globalHDRHeadroom.

## Code Example

```js
const texture = await new JXLLoader().loadAsync( 'image.jxl' );
const material = new THREE.MeshStandardMaterial( { emissive: 0xffffff, emissiveMap: texture } );
```

## Import

JXLLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { JXLLoader } from 'three/addons/loaders/JXLLoader.js';
```

## Constructor

### new JXLLoader()

## Methods

### .load( url : string, onLoad : function, onProgress : function, onError : function ) : DataTexture

Loads a native HDR image into a half-float data texture.

**url**

Image URL.

**onLoad**

Completion callback.

**onProgress**

Download progress callback.

**onError**

Error callback.

**Overrides:** [Loader#load](Loader.html#load)

**Returns:** Placeholder texture, populated after decoding.

### .parse( buffer : ArrayBuffer, onLoad : function, onError : function )

Decodes image bytes using the browser, preserving maximum HDR headroom.

**buffer**

JPEG XL bytes.

**onLoad**

Completion callback.

**onError**

Error callback.

**Overrides:** [Loader#parse](Loader.html#parse)

### .parseAsync( buffer : ArrayBuffer ) : Promise.<DataTexture> (async)

Async version of [JXLLoader#parse](JXLLoader.html#parse).

**buffer**

JPEG XL bytes.

**Returns:** Half-float texture in linear sRGB.

## Source

[examples/jsm/loaders/JXLLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/JXLLoader.js)