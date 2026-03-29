# VolumeShader

## Import

VolumeShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VolumeRenderShader1 } from 'three/addons/shaders/VolumeShader.js';
```

## Properties

### .VolumeRenderShader1 : ShaderMaterial~Shader (inner, constant)

Shaders to render 3D volumes using raycasting. The applied techniques are based on similar implementations in the Visvis and Vispy projects. This is not the only approach, therefore it's marked 1.

## Source

[examples/jsm/shaders/VolumeShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/VolumeShader.js)