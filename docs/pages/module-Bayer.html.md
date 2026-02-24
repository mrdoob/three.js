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

### .bayerDither( color : Node.<vec3>, steps : Node.<float> ) : Node.<vec3>

This TSL function applies Bayer dithering to a color input. It uses a 4x4 Bayer matrix pattern to add structured noise before color quantization, which helps reduce visible color banding when limiting color depth.

**color**

The input color to apply dithering to.

**steps**

The number of color steps per channel.

Default is `32`.

**Returns:** The dithered color ready for quantization.

## Source

[examples/jsm/tsl/math/Bayer.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/math/Bayer.js)