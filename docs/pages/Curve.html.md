# Curve

An abstract base class for creating an analytic curve object that contains methods for interpolation.

## Constructor

### new Curve() (abstract)

Constructs a new curve.

## Properties

### .arcLengthDivisions : number

This value determines the amount of divisions when calculating the cumulative segment lengths of a curve via [Curve#getLengths](Curve.html#getLengths). To ensure precision when using methods like [Curve#getSpacedPoints](Curve.html#getSpacedPoints), it is recommended to increase the value of this property if the curve is very large.

Default is `200`.

### .needsUpdate : boolean

Must be set to `true` if the curve parameters have changed.

Default is `false`.

### .type : string (readonly)

The type property is used for detecting the object type in context of serialization/deserialization.

## Methods

### .clone() : Curve

Returns a new curve with copied values from this instance.

**Returns:** A clone of this instance.

### .computeFrenetFrames( segments : number, closed : boolean ) : Object

Generates the Frenet Frames. Requires a curve definition in 3D space. Used in geometries like [TubeGeometry](TubeGeometry.html) or [ExtrudeGeometry](ExtrudeGeometry.html).

**segments**

The number of segments.

**closed**

Whether the curve is closed or not.

Default is `false`.

**Returns:** The Frenet Frames.

### .copy( source : Curve ) : Curve

Copies the values of the given curve to this instance.

**source**

The curve to copy.

**Returns:** A reference to this curve.

### .fromJSON( json : Object ) : Curve

Deserializes the curve from the given JSON.

**json**

The JSON holding the serialized curve.

**Returns:** A reference to this curve.

### .getLength() : number

Returns the total arc length of the curve.

**Returns:** The length of the curve.

### .getLengths( divisions : number ) : Array.<number>

Returns an array of cumulative segment lengths of the curve.

**divisions**

The number of divisions.

Default is `this.arcLengthDivisions`.

**Returns:** An array holding the cumulative segment lengths.

### .getPoint( t : number, optionalTarget : Vector2 | Vector3 ) : Vector2 | Vector3 (abstract)

This method returns a vector in 2D or 3D space (depending on the curve definition) for the given interpolation factor.

**t**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Returns:** The position on the curve. It can be a 2D or 3D vector depending on the curve definition.

### .getPointAt( u : number, optionalTarget : Vector2 | Vector3 ) : Vector2 | Vector3

This method returns a vector in 2D or 3D space (depending on the curve definition) for the given interpolation factor. Unlike [Curve#getPoint](Curve.html#getPoint), this method honors the length of the curve which equidistant samples.

**u**

A interpolation factor representing a position on the curve. Must be in the range `[0,1]`.

**optionalTarget**

The optional target vector the result is written to.

**Returns:** The position on the curve. It can be a 2D or 3D vector depending on the curve definition.

### .getPoints( divisions : number ) : Array.<(Vector2|Vector3)>

This method samples the curve via [Curve#getPoint](Curve.html#getPoint) and returns an array of points representing the curve shape.

**divisions**

The number of divisions.

Default is `5`.

**Returns:** An array holding the sampled curve values. The number of points is `divisions + 1`.

### .getSpacedPoints( divisions : number ) : Array.<(Vector2|Vector3)>

This method samples the curve via [Curve#getPointAt](Curve.html#getPointAt) and returns an array of points representing the curve shape. Unlike [Curve#getPoints](Curve.html#getPoints), this method returns equi-spaced points across the entire curve.

**divisions**

The number of divisions.

Default is `5`.

**Returns:** An array holding the sampled curve values. The number of points is `divisions + 1`.

### .getTangent( t : number, optionalTarget : Vector2 | Vector3 ) : Vector2 | Vector3

Returns a unit vector tangent for the given interpolation factor. If the derived curve does not implement its tangent derivation, two points a small delta apart will be used to find its gradient which seems to give a reasonable approximation.

**t**

The interpolation factor.

**optionalTarget**

The optional target vector the result is written to.

**Returns:** The tangent vector.

### .getTangentAt( u : number, optionalTarget : Vector2 | Vector3 ) : Vector2 | Vector3

Same as [Curve#getTangent](Curve.html#getTangent) but with equidistant samples.

**u**

The interpolation factor.

**optionalTarget**

The optional target vector the result is written to.

See:

*   [Curve#getPointAt](Curve.html#getPointAt)

**Returns:** The tangent vector.

### .getUtoTmapping( u : number, distance : number ) : number

Given an interpolation factor in the range `[0,1]`, this method returns an updated interpolation factor in the same range that can be ued to sample equidistant points from a curve.

**u**

The interpolation factor.

**distance**

An optional distance on the curve.

Default is `null`.

**Returns:** The updated interpolation factor.

### .toJSON() : Object

Serializes the curve into JSON.

See:

*   [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** A JSON object representing the serialized curve.

### .updateArcLengths()

Update the cumulative segment distance cache. The method must be called every time curve parameters are changed. If an updated curve is part of a composed curve like [CurvePath](CurvePath.html), this method must be called on the composed curve, too.

## Source

[src/extras/core/Curve.js](https://github.com/mrdoob/three.js/blob/master/src/extras/core/Curve.js)