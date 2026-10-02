# VoronoiNoise

## Import

VoronoiNoise is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { voronoi2d, voronoi3d } from 'three/addons/tsl/math/voronoiNoise.js';
```

## Static Methods

### .hash2d( p : Node.<vec2> ) : Node.<vec2>

Generates a pseudo-random vec2 from the given coordinate.

Reference: [https://www.shadertoy.com/view/MslGD8](https://www.shadertoy.com/view/MslGD8).

**p**

The input coordinate.

**Returns:** A pseudo-random value in the range `[0, 1]`.

### .hash3d( p : Node.<vec3> ) : Node.<vec3>

Generates a pseudo-random vec3 from the given coordinate.

**p**

The input coordinate.

**Returns:** A pseudo-random value in the range `[0, 1]`.

### .voronoi2d( p : Node.<vec2>, time : Node.<float> ) : Node.<float>

Animated 2D Voronoi noise. The feature points orbit inside their cells so the resulting pattern morphs over time.

Reference: [https://www.shadertoy.com/view/MslGD8](https://www.shadertoy.com/view/MslGD8).

**p**

The input coordinate.

**time**

The animation time.

**Returns:** The squared distance to the closest feature point, roughly in the range `[0, 1]`.

### .voronoi3d( p : Node.<vec3>, time : Node.<float> ) : Node.<float>

Animated 3D Voronoi noise. Like voronoi2d but with a volumetric input coordinate so the pattern can be applied to arbitrary surfaces without projection artifacts. Evaluates 27 cells instead of 9 and is therefore considerably more expensive than the 2D version.

**p**

The input coordinate.

**time**

The animation time.

**Returns:** The squared distance to the closest feature point, roughly in the range `[0, 1]`.

## Source

[examples/jsm/tsl/math/voronoiNoise.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/math/voronoiNoise.js)