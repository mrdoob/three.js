# RectAreaLightTexturesLib

Texture library for [RectAreaLight](RectAreaLight.html). This class holds the LTC BRDF data in data textures for further use in the renderer.

Reference: Real-Time Polygonal-Light Shading with Linearly Transformed Cosines by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt. [Code](https://github.com/selfshadow/ltc_code/).

NOTE: This is a temporary location for the BRDF approximation texture data based off of Eric Heitz's work (see citation). BRDF data for `RectAreaLight` is currently approximated using a precomputed texture of roughly 80kb in size. The hope is to find a better way to include the large texture data before including the full RectAreaLight implementation in the main build files.

## Import

RectAreaLightTexturesLib is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RectAreaLightTexturesLib } from 'three/addons/lights/RectAreaLightTexturesLib.js';
```

## Properties

### .LTC_FLOAT_1 : DataTexture

The first LTC FP32 data texture.

Default is `null`.

### .LTC_FLOAT_2 : DataTexture

The second LTC FP32 data texture.

Default is `null`.

### .LTC_HALF_1 : DataTexture

The first LTC FP16 data texture.

Default is `null`.

### .LTC_HALF_2 : DataTexture

The second LTC FP16 data texture.

Default is `null`.

## Static Methods

### .init() : RectAreaLightTexturesLib

Inits the texture library.

## Source

[examples/jsm/lights/RectAreaLightTexturesLib.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/RectAreaLightTexturesLib.js)