# MirrorShader

## Import

MirrorShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MirrorShader } from 'three/addons/shaders/MirrorShader.js';
```

## Properties

### .MirrorShader : ShaderMaterial~Shader (inner, constant)

Copies half the input to the other half.

side: side of input to mirror (0 = left, 1 = right, 2 = top, 3 = bottom).

## Source

[examples/jsm/shaders/MirrorShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/MirrorShader.js)