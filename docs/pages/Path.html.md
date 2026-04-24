*Inheritance: Curve → CurvePath →*

# Path

A 2D path representation. The class provides methods for creating paths and contours of 2D shapes similar to the 2D Canvas API.

## Code Example

```js
const path = new THREE.Path();
path.lineTo( 0, 0.8 );
path.quadraticCurveTo( 0, 1, 0.2, 1 );
path.lineTo( 1, 1 );
const points = path.getPoints();
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
const line = new THREE.Line( geometry, material );
scene.add( line );
```

## Constructor

### new Path( points : Array.<Vector2> )

Constructs a new path.

**points**

An array of 2D points defining the path.

## Properties

### .currentPoint : Vector2

The current offset of the path. Any new curve added will start here.

## Methods

### .absarc( aX : number, aY : number, aRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean ) : Path

Adds an absolutely positioned arc as an instance of [EllipseCurve](EllipseCurve.html) to the path.

**aX**

The x coordinate of the center of the arc.

Default is `0`.

**aY**

The y coordinate of the center of the arc.

Default is `0`.

**aRadius**

The radius of the arc.

Default is `1`.

**aStartAngle**

The start angle in radians.

Default is `0`.

**aEndAngle**

The end angle in radians.

Default is `Math.PI*2`.

**aClockwise**

Whether to sweep the arc clockwise or not.

Default is `false`.

**Returns:** A reference to this path.

### .absellipse( aX : number, aY : number, xRadius : number, yRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean, aRotation : number ) : Path

Adds an absolutely positioned ellipse as an instance of [EllipseCurve](EllipseCurve.html) to the path.

**aX**

The x coordinate of the absolute center of the ellipse.

Default is `0`.

**aY**

The y coordinate of the absolute center of the ellipse.

Default is `0`.

**xRadius**

The radius of the ellipse in the x axis.

Default is `1`.

**yRadius**

The radius of the ellipse in the y axis.

Default is `1`.

**aStartAngle**

The start angle in radians.

Default is `0`.

**aEndAngle**

The end angle in radians.

Default is `Math.PI*2`.

**aClockwise**

Whether to sweep the ellipse clockwise or not.

Default is `false`.

**aRotation**

The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.

Default is `0`.

**Returns:** A reference to this path.

### .arc( aX : number, aY : number, aRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean ) : Path

Adds an arc as an instance of [EllipseCurve](EllipseCurve.html) to the path, positioned relative to the current point.

**aX**

The x coordinate of the center of the arc offsetted from the previous curve.

Default is `0`.

**aY**

The y coordinate of the center of the arc offsetted from the previous curve.

Default is `0`.

**aRadius**

The radius of the arc.

Default is `1`.

**aStartAngle**

The start angle in radians.

Default is `0`.

**aEndAngle**

The end angle in radians.

Default is `Math.PI*2`.

**aClockwise**

Whether to sweep the arc clockwise or not.

Default is `false`.

**Returns:** A reference to this path.

### .bezierCurveTo( aCP1x : number, aCP1y : number, aCP2x : number, aCP2y : number, aX : number, aY : number ) : Path

Adds an instance of [CubicBezierCurve](CubicBezierCurve.html) to the path by connecting the current point with the given one.

**aCP1x**

The x coordinate of the first control point.

**aCP1y**

The y coordinate of the first control point.

**aCP2x**

The x coordinate of the second control point.

**aCP2y**

The y coordinate of the second control point.

**aX**

The x coordinate of the end point.

**aY**

The y coordinate of the end point.

**Returns:** A reference to this path.

### .ellipse( aX : number, aY : number, xRadius : number, yRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean, aRotation : number ) : Path

Adds an ellipse as an instance of [EllipseCurve](EllipseCurve.html) to the path, positioned relative to the current point

**aX**

The x coordinate of the center of the ellipse offsetted from the previous curve.

Default is `0`.

**aY**

The y coordinate of the center of the ellipse offsetted from the previous curve.

Default is `0`.

**xRadius**

The radius of the ellipse in the x axis.

Default is `1`.

**yRadius**

The radius of the ellipse in the y axis.

Default is `1`.

**aStartAngle**

The start angle in radians.

Default is `0`.

**aEndAngle**

The end angle in radians.

Default is `Math.PI*2`.

**aClockwise**

Whether to sweep the ellipse clockwise or not.

Default is `false`.

**aRotation**

The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.

Default is `0`.

**Returns:** A reference to this path.

### .lineTo( x : number, y : number ) : Path

Adds an instance of [LineCurve](LineCurve.html) to the path by connecting the current point with the given one.

**x**

The x coordinate of the end point.

**y**

The y coordinate of the end point.

**Returns:** A reference to this path.

### .moveTo( x : number, y : number ) : Path

Moves [Path#currentPoint](Path.html#currentPoint) to the given point.

**x**

The x coordinate.

**y**

The y coordinate.

**Returns:** A reference to this path.

### .quadraticCurveTo( aCPx : number, aCPy : number, aX : number, aY : number ) : Path

Adds an instance of [QuadraticBezierCurve](QuadraticBezierCurve.html) to the path by connecting the current point with the given one.

**aCPx**

The x coordinate of the control point.

**aCPy**

The y coordinate of the control point.

**aX**

The x coordinate of the end point.

**aY**

The y coordinate of the end point.

**Returns:** A reference to this path.

### .setFromPoints( points : Array.<Vector2> ) : Path

Creates a path from the given list of points. The points are added to the path as instances of [LineCurve](LineCurve.html).

**points**

An array of 2D points.

**Returns:** A reference to this path.

### .splineThru( pts : Array.<Vector2> ) : Path

Adds an instance of [SplineCurve](SplineCurve.html) to the path by connecting the current point with the given list of points.

**pts**

An array of points in 2D space.

**Returns:** A reference to this path.

## Source

[src/extras/core/Path.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/Path.js)