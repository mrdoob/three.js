# SimplexNoise

A utility class providing noise functions.

The code is based on [Simplex noise demystified](https://web.archive.org/web/20210210162332/http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf) by Stefan Gustavson, 2005.

## Import

SimplexNoise is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { SimplexNoise } from 'three/addons/math/SimplexNoise.js';
```

## Constructor

### new SimplexNoise( r : Object )

Constructs a new simplex noise object.

**r**

A math utility class that holds a `random()` method. This makes it possible to pass in custom random number generator.

Default is `Math`.

## Methods

### .noise( xin : number, yin : number ) : number

A 2D simplex noise method.

**xin**

The x coordinate.

**yin**

The y coordinate.

**Returns:** The noise value.

### .noise3d( xin : number, yin : number, zin : number ) : number

A 3D simplex noise method.

**xin**

The x coordinate.

**yin**

The y coordinate.

**zin**

The z coordinate.

**Returns:** The noise value.

### .noise4d( x : number, y : number, z : number, w : number ) : number

A 4D simplex noise method.

**x**

The x coordinate.

**y**

The y coordinate.

**z**

The z coordinate.

**w**

The w coordinate.

**Returns:** The noise value.

## Source

[examples/jsm/math/SimplexNoise.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/SimplexNoise.js)