# RectAreaLightUniformsLib

This class is only relevant when using [RectAreaLight](RectAreaLight.html) with [WebGLRenderer](WebGLRenderer.html).

Before rect area lights can be used, the internal uniform library of the renderer must be enhanced with the following code.

## Code Example

```js
RectAreaLightUniformsLib.init();
```

## Import

RectAreaLightUniformsLib is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
```

## Static Methods

### .init()

Inits the uniform library required when using rect area lights.

## Source

[examples/jsm/lights/RectAreaLightUniformsLib.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/lights/RectAreaLightUniformsLib.js)