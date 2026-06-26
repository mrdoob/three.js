# MathUtils

A collection of math utility functions.

## Static Methods

### .ceilPowerOfTwo( value : number ) : number

Returns the smallest power of two that is greater than or equal to the given number.

**value**

The value to find a POT for.

**Returns:** The smallest power of two that is greater than or equal to the given number.

### .clamp( value : number, min : number, max : number ) : number

Clamps the given value between min and max.

**value**

The value to clamp.

**min**

The min value.

**max**

The max value.

**Returns:** The clamped value.

### .damp( x : number, y : number, lambda : number, dt : number ) : number

Smoothly interpolate a number from `x` to `y` in a spring-like manner using a delta time to maintain frame rate independent movement. For details, see [Frame rate independent damping using lerp](http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/).

**x**

The current point.

**y**

The target point.

**lambda**

A higher lambda value will make the movement more sudden, and a lower value will make the movement more gradual.

**dt**

Delta time in seconds.

**Returns:** The interpolated value.

### .degToRad( degrees : number ) : number

Converts degrees to radians.

**degrees**

A value in degrees.

**Returns:** The converted value in radians.

### .denormalize( value : number, array : TypedArray ) : number

Denormalizes the given value according to the given typed array.

**value**

The value to denormalize.

**array**

The typed array that defines the data type of the value.

**Returns:** The denormalize (float) value in the range `[0,1]`.

### .euclideanModulo( n : number, m : number ) : number

Computes the Euclidean modulo of the given parameters that is `( ( n % m ) + m ) % m`.

**n**

The first parameter.

**m**

The second parameter.

**Returns:** The Euclidean modulo.

### .floorPowerOfTwo( value : number ) : number

Returns the largest power of two that is less than or equal to the given number.

**value**

The value to find a POT for.

**Returns:** The largest power of two that is less than or equal to the given number.

### .generateUUID() : string

Generate a [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) (universally unique identifier).

**Returns:** The UUID.

### .inverseLerp( x : number, y : number, value : number ) : number

Returns the percentage in the closed interval `[0, 1]` of the given value between the start and end point.

**x**

The start point

**y**

The end point.

**value**

A value between start and end.

**Returns:** The interpolation factor.

### .isPowerOfTwo( value : number ) : boolean

Returns `true` if the given number is a power of two.

**value**

The value to check.

**Returns:** Whether the given number is a power of two or not.

### .lerp( x : number, y : number, t : number ) : number

Returns a value linearly interpolated from two known points based on the given interval - `t = 0` will return `x` and `t = 1` will return `y`.

**x**

The start point

**y**

The end point.

**t**

The interpolation factor in the closed interval `[0, 1]`.

**Returns:** The interpolated value.

### .mapLinear( x : number, a1 : number, a2 : number, b1 : number, b2 : number ) : number

Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>` for the given value.

**x**

The value to be mapped.

**a1**

Minimum value for range A.

**a2**

Maximum value for range A.

**b1**

Minimum value for range B.

**b2**

Maximum value for range B.

**Returns:** The mapped value.

### .normalize( value : number, array : TypedArray ) : number

Normalizes the given value according to the given typed array.

**value**

The float value in the range `[0,1]` to normalize.

**array**

The typed array that defines the data type of the value.

**Returns:** The normalize value.

### .pingpong( x : number, length : number ) : number

Returns a value that alternates between `0` and the given `length` parameter.

**x**

The value to pingpong.

**length**

The positive value the function will pingpong to.

Default is `1`.

**Returns:** The alternated value.

### .radToDeg( radians : number ) : number

Converts radians to degrees.

**radians**

A value in radians.

**Returns:** The converted value in degrees.

### .randFloat( low : number, high : number ) : number

Returns a random float from `<low, high>` interval.

**low**

The lower value boundary.

**high**

The upper value boundary

**Returns:** A random float.

### .randFloatSpread( range : number ) : number

Returns a random integer from `<-range/2, range/2>` interval.

**range**

Defines the value range.

**Returns:** A random float.

### .randInt( low : number, high : number ) : number

Returns a random integer from `<low, high>` interval.

**low**

The lower value boundary.

**high**

The upper value boundary

**Returns:** A random integer.

### .seededRandom( s : number ) : number

Returns a deterministic pseudo-random float in the interval `[0, 1]`.

**s**

The integer seed.

**Returns:** A random float.

### .setQuaternionFromProperEuler( q : Quaternion, a : number, b : number, c : number, order : 'XYX' | 'XZX' | 'YXY' | 'YZY' | 'ZXZ' | 'ZYZ' )

Sets the given quaternion from the [Intrinsic Proper Euler Angles](https://en.wikipedia.org/wiki/Euler_angles) defined by the given angles and order.

Rotations are applied to the axes in the order specified by order: rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.

**q**

The quaternion to set.

**a**

The rotation applied to the first axis, in radians.

**b**

The rotation applied to the second axis, in radians.

**c**

The rotation applied to the third axis, in radians.

**order**

A string specifying the axes order.

### .smootherstep( x : number, min : number, max : number ) : number

A [variation on smoothstep](https://en.wikipedia.org/wiki/Smoothstep#Variations) that has zero 1st and 2nd order derivatives at x=0 and x=1.

**x**

The value to evaluate based on its position between min and max.

**min**

The min value. Any x value below min will be `0`.

**max**

The max value. Any x value above max will be `1`.

**Returns:** The alternated value.

### .smoothstep( x : number, min : number, max : number ) : number

Returns a value in the range `[0,1]` that represents the percentage that `x` has moved between `min` and `max`, but smoothed or slowed down the closer `x` is to the `min` and `max`.

See [Smoothstep](http://en.wikipedia.org/wiki/Smoothstep) for more details.

**x**

The value to evaluate based on its position between min and max.

**min**

The min value. Any x value below min will be `0`.

**max**

The max value. Any x value above max will be `1`.

**Returns:** The alternated value.

## Source

[src/math/MathUtils.js](https://github.com/mrdoob/three.js/blob/master/src/math/MathUtils.js)