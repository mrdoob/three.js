# VerticalBlurShader

## Import

VerticalBlurShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';
```

## Properties

### .VerticalBlurShader : ShaderMaterial~Shader (inner, constant)

Two pass Gaussian blur filter (horizontal and vertical blur shaders)

*   see [http://www.cake23.de/traveling-wavefronts-lit-up.html](http://www.cake23.de/traveling-wavefronts-lit-up.html)
    
*   9 samples per pass
    
*   standard deviation 2.7
    
*   "h" and "v" parameters should be set to "1 / width" and "1 / height"
    

## Source

[examples/jsm/shaders/VerticalBlurShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/VerticalBlurShader.js)