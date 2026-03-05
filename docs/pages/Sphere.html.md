# Sphere

An analytical 3D sphere defined by a center and radius. This class is mainly used as a Bounding Sphere for 3D objects.

## Constructor

### new Sphere( center : Vector3, radius : number )

Constructs a new sphere.

**center**

The center of the sphere

Default is `(0,0,0)`.

**radius**

The radius of the sphere.

Default is `-1`.

## Properties

### .center : Vector3

The center of the sphere

### .isSphere : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .radius : number

The radius of the sphere.

## Methods

### .applyMatrix4( matrix : Matrix4 ) : Sphere

Transforms this sphere with the given 4x4 transformation matrix.

**matrix**

The transformation matrix.

**Returns:** A reference to this sphere.

### .clampPoint( point : Vector3, target : Vector3 ) : Vector3

Clamps a point within the sphere. If the point is outside the sphere, it will clamp it to the closest point on the edge of the sphere. Points already inside the sphere will not be affected.

**point**

The plane to clamp.

**target**

The target vector that is used to store the method's result.

**Returns:** The clamped point.

### .clone() : Sphere

Returns a new sphere with copied values from this instance.

**Returns:** A clone of this instance.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if this sphere contains the given point inclusive of the surface of the sphere.

**point**

The point to check.

**Returns:** Whether this sphere contains the given point or not.

### .copy( sphere : Sphere ) : Sphere

Copies the values of the given sphere to this instance.

**sphere**

The sphere to copy.

**Returns:** A reference to this sphere.

### .distanceToPoint( point : Vector3 ) : number

Returns the closest distance from the boundary of the sphere to the given point. If the sphere contains the point, the distance will be negative.

**point**

The point to compute the distance to.

**Returns:** The distance to the point.

### .equals( sphere : Sphere ) : boolean

Returns `true` if this sphere is equal with the given one.

**sphere**

The sphere to test for equality.

**Returns:** Whether this bounding sphere is equal with the given one.

### .expandByPoint( point : Vector3 ) : Sphere

Expands the boundaries of this sphere to include the given point.

**point**

The point to include.

**Returns:** A reference to this sphere.

### .fromJSON( json : Object ) : Sphere

Returns a serialized structure of the bounding sphere.

**json**

The serialized json to set the sphere from.

**Returns:** A reference to this bounding sphere.

### .getBoundingBox( target : Box3 ) : Box3

Returns a bounding box that encloses this sphere.

**target**

The target box that is used to store the method's result.

**Returns:** The bounding box that encloses this sphere.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if this sphere intersects with the given box.

**box**

The box to test.

**Returns:** Whether this sphere intersects with the given box or not.

### .intersectsPlane( plane : Plane ) : boolean

Returns `true` if this sphere intersects with the given plane.

**plane**

The plane to test.

**Returns:** Whether this sphere intersects with the given plane or not.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if this sphere intersects with the given one.

**sphere**

The sphere to test.

**Returns:** Whether this sphere intersects with the given one or not.

### .isEmpty() : boolean

Returns `true` if the sphere is empty (the radius set to a negative number).

Spheres with a radius of `0` contain only their center point and are not considered to be empty.

**Returns:** Whether this sphere is empty or not.

### .makeEmpty() : Sphere

Makes this sphere empty which means in encloses a zero space in 3D.

**Returns:** A reference to this sphere.

### .set( center : Vector3, radius : number ) : Sphere

Sets the sphere's components by copying the given values.

**center**

The center.

**radius**

The radius.

**Returns:** A reference to this sphere.

### .setFromPoints( points : Array.<Vector3>, optionalCenter : Vector3 ) : Sphere

Computes the minimum bounding sphere for list of points. If the optional center point is given, it is used as the sphere's center. Otherwise, the center of the axis-aligned bounding box encompassing the points is calculated.

**points**

A list of points in 3D space.

**optionalCenter**

The center of the sphere.

**Returns:** A reference to this sphere.

### .toJSON() : Object

Returns a serialized structure of the bounding sphere.

**Returns:** Serialized structure with fields representing the object state.

### .translate( offset : Vector3 ) : Sphere

Translates the sphere's center by the given offset.

**offset**

The offset.

**Returns:** A reference to this sphere.

### .union( sphere : Sphere ) : Sphere

Expands this sphere to enclose both the original sphere and the given sphere.

**sphere**

The sphere to include.

**Returns:** A reference to this sphere.

## Source

[src/math/Sphere.js](https://github.com/mrdoob/three.js/blob/master/src/math/Sphere.js)