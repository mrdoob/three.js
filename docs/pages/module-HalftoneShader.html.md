# HalftoneShader

## Import

HalftoneShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { HalftoneShader } from 'three/addons/shaders/HalftoneShader.js';
```

## Properties

### .HalftoneShader : ShaderMaterial~Shader (inner, constant)

RGB Halftone shader.

Used by [HalftonePass](HalftonePass.html).

Shape (1 = Dot, 2 = Ellipse, 3 = Line, 4 = Square, 5 = Diamond) Blending Mode (1 = Linear, 2 = Multiply, 3 = Add, 4 = Lighter, 5 = Darker)

## Source

[examples/jsm/shaders/HalftoneShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/HalftoneShader.js)