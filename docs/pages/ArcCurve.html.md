*Inheritance: Curve → EllipseCurve →*

# ArcCurve

A curve representing an arc.

## Constructor

### new ArcCurve( aX : number, aY : number, aRadius : number, aStartAngle : number, aEndAngle : number, aClockwise : boolean )

Constructs a new arc curve.

**aX**

The X center of the ellipse.

Default is `0`.

**aY**

The Y center of the ellipse.

Default is `0`.

**aRadius**

The radius of the ellipse in the x direction.

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

## Properties

### .isArcCurve : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Source

[src/extras/curves/ArcCurve.js](https://github.com/mrdoob/three.js/blob/master/src/extras/curves/ArcCurve.js)