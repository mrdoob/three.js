*Inheritance: Curve →*

# QuadraticBezierCurve

A curve representing a 2D Quadratic Bezier curve.

## Code Example

```js
const curve = new THREE.QuadraticBezierCurve(
	new THREE.Vector2( - 10, 0 ),
	new THREE.Vector2( 20, 15 ),
	new THREE.Vector2( 10, 0 )
)
const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
// Create the final object to add to the scene
const curveObject = new THREE.Line( geometry, material );
```

## Constructor

### new QuadraticBezierCurve( v0 : Vector2, v1 : Vector2, v2 : Vector2 )

Constructs a new Quadratic Bezier curve.

**v0**

The start point.

**v1**

The control point.

**v2**

The end point.

## Properties

### .isQuadraticBezierCurve : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .v0 : Vector2

The start point.

### .v1 : Vector2

The control point.

### .v2 : Vector2

The end point.

## Methods

### .getPoint( t : number, optionalTarget : Vector2 ) : Vector2

Returns a point on the curve.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Overrides:** [Curve#getPoint](Curve.html#getPoint)

**Returns:** The position on the curve.

## Source

[src/extras/curves/QuadraticBezierCurve.js](https://github.com/mrdoob/three.js/blob/master/src/extras/curves/QuadraticBezierCurve.js)