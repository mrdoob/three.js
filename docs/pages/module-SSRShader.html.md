# SSRShader

## Import

SSRShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as SSRShader from 'three/addons/shaders/SSRShader.js';
```

A collection of shaders used for SSR.

References:

*   [3D Game Shaders For Beginners, Screen Space Reflection (SSR)](https://lettier.github.io/3d-game-shaders-for-beginners/screen-space-reflection.html).

## Properties

### .SSRBlurShader : ShaderMaterial~Shader (inner, constant)

SSR Blur shader.

### .SSRDepthShader : ShaderMaterial~Shader (inner, constant)

SSR Depth shader.

### .SSRShader : ShaderMaterial~Shader (inner, constant)

SSR shader.

## Source

[examples/jsm/shaders/SSRShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/SSRShader.js)