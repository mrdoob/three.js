# HueSaturationShader

## Import

HueSaturationShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { HueSaturationShader } from 'three/addons/shaders/HueSaturationShader.js';
```

## Properties

### .HueSaturationShader : ShaderMaterial~Shader (inner, constant)

Hue and saturation adjustment, [https://github.com/evanw/glfx.js](https://github.com/evanw/glfx.js).

hue: -1 to 1 (-1 is 180 degrees in the negative direction, 0 is no change, etc. saturation: -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)

## Source

[examples/jsm/shaders/HueSaturationShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/HueSaturationShader.js)