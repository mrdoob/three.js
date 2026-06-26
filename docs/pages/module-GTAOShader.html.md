# GTAOShader

## Import

GTAOShader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GTAOShader } from 'three/addons/shaders/GTAOShader.js';
```

## Properties

### .GTAOBlendShader : Object (inner, constant)

GTAO blend shader. Use by [GTAOPass](GTAOPass.html).

### .GTAODepthShader : Object (inner, constant)

GTAO depth shader. Use by [GTAOPass](GTAOPass.html).

### .GTAOShader : ShaderMaterial~Shader (inner, constant)

GTAO shader. Use by [GTAOPass](GTAOPass.html).

References:

*   [Practical Realtime Strategies for Accurate Indirect Occlusion](https://iryoku.com/downloads/Practical-Realtime-Strategies-for-Accurate-Indirect-Occlusion.pdf).
*   [Horizon-Based Indirect Lighting (HBIL)](https://github.com/Patapom/GodComplex/blob/master/Tests/TestHBIL/2018%20Mayaux%20-%20Horizon-Based%20Indirect%20Lighting%20\(HBIL\).pdf)

## Source

[examples/jsm/shaders/GTAOShader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/shaders/GTAOShader.js)