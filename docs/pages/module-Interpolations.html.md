# Interpolations

Interpolations contains spline and Bézier functions internally used by concrete curve classes.

Bezier Curves formulas obtained from: https://en.wikipedia.org/wiki/B%C3%A9zier\_curve

## Methods

### .CatmullRom( t : number, p0 : number, p1 : number, p2 : number, p3 : number ) : number (inner)

Computes a point on a Catmull-Rom spline.

**t**

The interpolation factor.

**p0**

The first control point.

**p1**

The second control point.

**p2**

The third control point.

**p3**

The fourth control point.

**Returns:** The calculated point on a Catmull-Rom spline.

### .CubicBezier( t : number, p0 : number, p1 : number, p2 : number, p3 : number ) : number (inner)

Computes a point on a Cubic Bezier curve.

**t**

The interpolation factor.

**p0**

The first control point.

**p1**

The second control point.

**p2**

The third control point.

**p3**

The fourth control point.

**Returns:** The calculated point on a Cubic Bezier curve.

### .QuadraticBezier( t : number, p0 : number, p1 : number, p2 : number ) : number (inner)

Computes a point on a Quadratic Bezier curve.

**t**

The interpolation factor.

**p0**

The first control point.

**p1**

The second control point.

**p2**

The third control point.

**Returns:** The calculated point on a Quadratic Bezier curve.

## Source

[src/extras/core/Interpolations.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/Interpolations.js)