# FXAAShader

## Import

FXAAShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
```

## Properties

### .FXAAShader : ShaderMaterial~Shader (inner, constant)

FXAA algorithm from NVIDIA, C# implementation by Jasper Flick, GLSL port by Dave Hoskins.

References:

*   [http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA\_WhitePaper.pdf](http://developer.download.nvidia.com/assets/gamedev/files/sdk/11/FXAA_WhitePaper.pdf).
*   [https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/](https://catlikecoding.com/unity/tutorials/advanced-rendering/fxaa/).

## Source

[examples/jsm/shaders/FXAAShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/FXAAShader.js)