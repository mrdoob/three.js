# SMAAShader

## Import

SMAAShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SMAAShader } from 'three/addons/shaders/SMAAShader.js';
```

WebGL port of Subpixel Morphological Antialiasing (SMAA) v2.8 Preset: SMAA 1x Medium (with color edge detection)

References:

*   [https://github.com/iryoku/smaa/releases/tag/v2.8](https://github.com/iryoku/smaa/releases/tag/v2.8)

## Properties

### .SMAABlendShader : ShaderMaterial~Shader (inner, constant)

SMAA Blend shader.

### .SMAAEdgesShader : ShaderMaterial~Shader (inner, constant)

SMAA Edges shader.

### .SMAAWeightsShader : ShaderMaterial~Shader (inner, constant)

SMAA Weights shader.

## Source

[examples/jsm/shaders/SMAAShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/SMAAShader.js)