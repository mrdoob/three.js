# RGBShiftShader

## Import

RGBShiftShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';
```

## Properties

### .RGBShiftShader : ShaderMaterial~Shader (inner, constant)

RGB Shift Shader Shifts red and blue channels from center in opposite directions Ported from https://web.archive.org/web/20090820185047/http://kriss.cx/tom/2009/05/rgb-shift/ by Tom Butterworth / https://web.archive.org/web/20090810054752/http://kriss.cx/tom/

amount: shift distance (1 is width of input) angle: shift angle in radians

## Source

[examples/jsm/shaders/RGBShiftShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/RGBShiftShader.js)