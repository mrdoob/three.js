*Inheritance: Curve → CurvePath → Path →*

# Shape

Defines an arbitrary 2d shape plane using paths with optional holes. It can be used with [ExtrudeGeometry](ExtrudeGeometry.html), [ShapeGeometry](ShapeGeometry.html), to get points, or to get triangulated faces.

## Code Example

```js
const heartShape = new THREE.Shape();
heartShape.moveTo( 25, 25 );
heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
heartShape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
heartShape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );
const extrudeSettings = {
	depth: 8,
	bevelEnabled: true,
	bevelSegments: 2,
	steps: 2,
	bevelSize: 1,
	bevelThickness: 1
};
const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );
const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial() );
```

## Constructor

### new Shape( points : Array.<Vector2> )

Constructs a new shape.

**points**

An array of 2D points defining the shape.

## Properties

### .holes : Array.<Path> (readonly)

Defines the holes in the shape. Hole definitions must use the opposite winding order (CW/CCW) than the outer shape.

### .uuid : string (readonly)

The UUID of the shape.

## Methods

### .extractPoints( divisions : number ) : Object

Returns an object that holds contour data for the shape and its holes as arrays of 2D points.

**divisions**

The fineness of the result.

**Returns:** An object with contour data.

### .getPointsHoles( divisions : number ) : Array.<Array.<Vector2>>

Returns an array representing each contour of the holes as a list of 2D points.

**divisions**

The fineness of the result.

**Returns:** The holes as a series of 2D points.

## Source

[src/extras/core/Shape.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/Shape.js)