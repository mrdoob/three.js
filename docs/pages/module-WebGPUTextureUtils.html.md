# WebGPUTextureUtils

## Import

WebGPUTextureUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as WebGPUTextureUtils from 'three/addons/utils/WebGPUTextureUtils.js';
```

## Static Methods

### .decompress( blitTexture : CompressedTexture, maxTextureSize : number, renderer : WebGPURenderer ) : Promise.<CanvasTexture> (async)

Returns an uncompressed version of the given compressed texture.

This module can only be used with [WebGPURenderer](WebGPURenderer.html). When using [WebGLRenderer](WebGLRenderer.html), import the function from [WebGLTextureUtils](WebGLTextureUtils.html).

**blitTexture**

The compressed texture.

**maxTextureSize**

The maximum size of the uncompressed texture.

Default is `Infinity`.

**renderer**

A reference to a renderer.

Default is `null`.

**Returns:** A Promise that resolved with the uncompressed texture.

## Source

[examples/jsm/utils/WebGPUTextureUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/WebGPUTextureUtils.js)