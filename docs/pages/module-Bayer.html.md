# Bayer

## Import

Bayer is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { bayer16 } from 'three/addons/tsl/math/Bayer.js';
```

## Static Methods

### .bayer16( uv : Node.<vec2> ) : Node.<vec4>

This TSL function can be used to sample a Bayer16 texture which is a 16x16 texture with a Bayer Matrix pattern. It can be used for dithering effects but also as an alternative to blue-noise. When used with Ray Marching specifically in [VolumeNodeMaterial#offsetNode](VolumeNodeMaterial.html#offsetNode), it reduces banding problem, thus being able to use fewer steps without affecting the visuals as much.

**uv**

The uv to sample the bayer16 texture.

**Returns:** The sampled bayer value.

## Source

[examples/jsm/tsl/math/Bayer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/math/Bayer.js)