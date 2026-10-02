# DepthLimitedBlurShader

## Import

DepthLimitedBlurShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { DepthLimitedBlurShader, BlurShaderUtils } from 'three/addons/shaders/DepthLimitedBlurShader.js';
```

## Properties

### .DepthLimitedBlurShader : ShaderMaterial~Shader (inner, constant)

A separable Gaussian blur shader that limits blurring across depth discontinuities, stopping when the view-space depth difference to a neighboring sample exceeds `depthCutoff`. This preserves edges and avoids bleeding across them.

Used by [SAOPass](SAOPass.html).

## Source

[examples/jsm/shaders/DepthLimitedBlurShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/DepthLimitedBlurShader.js)