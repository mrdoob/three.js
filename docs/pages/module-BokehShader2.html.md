# BokehShader2

## Import

BokehShader2 is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { BokehShader, BokehDepthShader } from 'three/addons/shaders/BokehShader2.js';
```

## Properties

### .BokehShader : ShaderMaterial~Shader (inner, constant)

Depth-of-field shader with bokeh ported from [GLSL shader by Martins Upitis](http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-\(update\)).

Requires #define RINGS and SAMPLES integers

## Source

[examples/jsm/shaders/BokehShader2.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/BokehShader2.js)