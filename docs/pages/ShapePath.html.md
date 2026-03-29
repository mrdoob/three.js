# ShapePath

This class is used to convert a series of paths to an array of shapes. It is specifically used in context of fonts and SVG.

## Constructor

### new ShapePath()

Constructs a new shape path.

## Properties

### .color : Color

The color of the shape.

### .currentPath : Path

The current path that is being generated.

Default is `null`.

### .subPaths : Array.<Path>

The paths that have been generated for this shape.

Default is `null`.

## Methods

### .bezierCurveTo( aCP1x : number, aCP1y : number, aCP2x : number, aCP2y : number, aX : number, aY : number ) : ShapePath

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

**Returns:** A reference to this shape path.

### .lineTo( x : number, y : number ) : ShapePath

Adds an instance of [LineCurve](LineCurve.html) to the path by connecting the current point with the given one.

**x**

The x coordinate of the end point.

**y**

The y coordinate of the end point.

**Returns:** A reference to this shape path.

### .moveTo( x : number, y : number ) : ShapePath

Creates a new path and moves it current point to the given one.

**x**

The x coordinate.

**y**

The y coordinate.

**Returns:** A reference to this shape path.

### .quadraticCurveTo( aCPx : number, aCPy : number, aX : number, aY : number ) : ShapePath

Adds an instance of [QuadraticBezierCurve](QuadraticBezierCurve.html) to the path by connecting the current point with the given one.

**aCPx**

The x coordinate of the control point.

**aCPy**

The y coordinate of the control point.

**aX**

The x coordinate of the end point.

**aY**

The y coordinate of the end point.

**Returns:** A reference to this shape path.

### .splineThru( pts : Array.<Vector2> ) : ShapePath

Adds an instance of [SplineCurve](SplineCurve.html) to the path by connecting the current point with the given list of points.

**pts**

An array of points in 2D space.

**Returns:** A reference to this shape path.

### .toShapes( isCCW : boolean ) : Array.<Shape>

Converts the paths into an array of shapes.

**isCCW**

By default solid shapes are defined clockwise (CW) and holes are defined counterclockwise (CCW). If this flag is set to `true`, then those are flipped.

**Returns:** An array of shapes.

## Source

[src/extras/core/ShapePath.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/ShapePath.js)