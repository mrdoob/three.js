# GeometryUtils

## Import

GeometryUtils is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';
```

## Methods

### .gosper( size : number ) : Array.<number> (inner)

Generates a Gosper curve (lying in the XY plane).

Reference: [https://gist.github.com/nitaku/6521802](https://gist.github.com/nitaku/6521802)

**size**

The size of a single gosper island.

Default is `1`.

**Returns:** The gosper island points.

### .hilbert2D( center : Vector3, size : number, iterations : number, v0 : number, v1 : number, v2 : number, v3 : number ) : Array.<Vector3> (inner)

Generates 2D-Coordinates along a Hilbert curve.

Based on work by: [http://www.openprocessing.org/sketch/15493](http://www.openprocessing.org/sketch/15493)

**center**

Center of Hilbert curve.

**size**

Total width of Hilbert curve.

Default is `10`.

**iterations**

Number of subdivisions.

Default is `10`.

**v0**

Corner index -X, -Z.

Default is `0`.

**v1**

Corner index -X, +Z.

Default is `1`.

**v2**

Corner index +X, +Z.

Default is `2`.

**v3**

Corner index +X, -Z.

Default is `3`.

**Returns:** The Hilbert curve points.

### .hilbert3D( center : Vector3, size : number, iterations : number, v0 : number, v1 : number, v2 : number, v3 : number, v4 : number, v5 : number, v6 : number, v7 : number ) : Array.<Vector3> (inner)

Generates 3D-Coordinates along a Hilbert curve.

Based on work by: [https://openprocessing.org/user/5654](https://openprocessing.org/user/5654)

**center**

Center of Hilbert curve.

**size**

Total width of Hilbert curve.

Default is `10`.

**iterations**

Number of subdivisions.

Default is `1`.

**v0**

Corner index -X, +Y, -Z.

Default is `0`.

**v1**

Corner index -X, +Y, +Z.

Default is `1`.

**v2**

Corner index -X, -Y, +Z.

Default is `2`.

**v3**

Corner index -X, -Y, -Z.

Default is `3`.

**v4**

Corner index +X, -Y, -Z.

Default is `4`.

**v5**

Corner index +X, -Y, +Z.

Default is `5`.

**v6**

Corner index +X, +Y, +Z.

Default is `6`.

**v7**

Corner index +X, +Y, -Z.

Default is `7`.

**Returns:**

*   The Hilbert curve points.

## Source

[examples/jsm/utils/GeometryUtils.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/utils/GeometryUtils.js)