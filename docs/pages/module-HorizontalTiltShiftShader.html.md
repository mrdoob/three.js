# HorizontalTiltShiftShader

## Import

HorizontalTiltShiftShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { HorizontalTiltShiftShader } from 'three/addons/shaders/HorizontalTiltShiftShader.js';
```

## Properties

### .HorizontalTiltShiftShader : ShaderMaterial~Shader (inner, constant)

Simple fake tilt-shift effect, modulating two pass Gaussian blur (see above) by vertical position.

*   9 samples per pass
*   standard deviation 2.7
*   "h" and "v" parameters should be set to "1 / width" and "1 / height"
*   "r" parameter control where "focused" horizontal line lies

## Source

[examples/jsm/shaders/HorizontalTiltShiftShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/HorizontalTiltShiftShader.js)