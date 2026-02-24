# ImprovedNoise

A utility class providing a 3D noise function.

The code is based on [IMPROVED NOISE](https://cs.nyu.edu/~perlin/noise/) by Ken Perlin, 2002.

## Import

ImprovedNoise is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ImprovedNoise } from 'three/addons/math/ImprovedNoise.js';
```

## Constructor

### new ImprovedNoise()

## Methods

### .noise( x : number, y : number, z : number ) : number

Returns a noise value for the given parameters.

**x**

The x coordinate.

**y**

The y coordinate.

**z**

The z coordinate.

**Returns:** The noise value.

## Source

[examples/jsm/math/ImprovedNoise.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/ImprovedNoise.js)