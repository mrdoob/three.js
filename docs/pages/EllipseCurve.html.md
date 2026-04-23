*Inheritance: Curve →*

# EllipseCurve

A curve representing an ellipse.

## Code Example

```js
const curve = new THREE.EllipseCurve(
	0, 0,
	10, 10,
	0, 2 * Math.PI,
	false,
	0
);
const points = curve.getPoints( 50 );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const material = new THREE.LineBasicMaterial( { color: 0xff0000 } );
// Create the final object to add to the scene
const ellipse = new THREE.Line( geometry, material );
```

## Constructor

### new EllipseCurve( aX : number, aY : number, xRadius : number, yRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean, aRotation : number )

Constructs a new ellipse curve.

**aX**

The X center of the ellipse.

Default is `0`.

**aY**

The Y center of the ellipse.

Default is `0`.

**xRadius**

The radius of the ellipse in the x direction.

Default is `1`.

**yRadius**

The radius of the ellipse in the y direction.

Default is `1`.

**aStartAngle**

The start angle of the curve in radians starting from the positive X axis.

Default is `0`.

**aEndAngle**

The end angle of the curve in radians starting from the positive X axis.

Default is `Math.PI*2`.

**aClockwise**

Whether the ellipse is drawn clockwise or not.

Default is `false`.

**aRotation**

The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.

Default is `0`.

## Properties

### .aClockwise : boolean

Whether the ellipse is drawn clockwise or not.

Default is `false`.

### .aEndAngle : number

The end angle of the curve in radians starting from the positive X axis.

Default is `Math.PI*2`.

### .aRotation : number

The rotation angle of the ellipse in radians, counterclockwise from the positive X axis.

Default is `0`.

### .aStartAngle : number

The start angle of the curve in radians starting from the positive X axis.

Default is `0`.

### .aX : number

The X center of the ellipse.

Default is `0`.

### .aY : number

The Y center of the ellipse.

Default is `0`.

### .isEllipseCurve : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .xRadius : number

The radius of the ellipse in the x direction. Setting the this value equal to the [EllipseCurve#yRadius](EllipseCurve.html#yRadius) will result in a circle.

Default is `1`.

### .yRadius : number

The radius of the ellipse in the y direction. Setting the this value equal to the [EllipseCurve#xRadius](EllipseCurve.html#xRadius) will result in a circle.

Default is `1`.

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

[src/extras/curves/EllipseCurve.js](https://github.com/mrdoob/three.js/blob/master/src/extras/curves/EllipseCurve.js)