# PoissonDenoiseShader

## Import

PoissonDenoiseShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PoissonDenoiseShader } from 'three/addons/shaders/PoissonDenoiseShader.js';
```

## Properties

### .PoissonDenoiseShader : ShaderMaterial~Shader (inner, constant)

Poisson Denoise Shader.

References:

*   [Self-Supervised Poisson-Gaussian Denoising](https://openaccess.thecvf.com/content/WACV2021/papers/Khademi_Self-Supervised_Poisson-Gaussian_Denoising_WACV_2021_paper.pdf).
*   [Poisson2Sparse: Self-Supervised Poisson Denoising From a Single Image](https://arxiv.org/pdf/2206.01856.pdf)

## Source

[examples/jsm/shaders/PoissonDenoiseShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/PoissonDenoiseShader.js)