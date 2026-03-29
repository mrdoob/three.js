# OBB

Represents an oriented bounding box (OBB) in 3D space.

## Import

OBB is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OBB } from 'three/addons/math/OBB.js';
```

## Constructor

### new OBB( center : Vector3, halfSize : Vector3, rotation : Matrix3 )

Constructs a new OBB.

**center**

The center of the OBB.

**halfSize**

Positive halfwidth extents of the OBB along each axis.

**rotation**

The rotation of the OBB.

## Properties

### .center : Vector3

The center of the OBB.

### .halfSize : Vector3

Positive halfwidth extents of the OBB along each axis.

### .rotation : Matrix3

The rotation of the OBB.

## Methods

### .applyMatrix4( matrix : Matrix4 ) : OBB

Applies the given transformation matrix to this OBB. This method can be used to transform the bounding volume with the world matrix of a 3D object in order to keep both entities in sync.

**matrix**

The matrix to apply.

**Returns:** A reference of this OBB.

### .clampPoint( point : Vector3, target : Vector3 ) : Vector3

Clamps the given point within the bounds of this OBB.

**point**

The point that should be clamped within the bounds of this OBB.

**target**

The target vector that is used to store the method's result.

**Returns:**

*   The clamped point.

### .clone() : OBB

Returns a new OBB with copied values from this instance.

**Returns:** A clone of this instance.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if the given point lies within this OBB.

**point**

The point to test.

**Returns:**

*   Whether the given point lies within this OBB or not.

### .copy( obb : OBB ) : OBB

Copies the values of the given OBB to this instance.

**obb**

The OBB to copy.

**Returns:** A reference to this OBB.

### .equals( obb : OBB ) : boolean

Returns `true` if the given OBB is equal to this OBB.

**obb**

The OBB to test.

**Returns:** Whether the given OBB is equal to this OBB or not.

### .fromBox3( box3 : Box3 ) : OBB

Defines an OBB based on the given AABB.

**box3**

The AABB to setup the OBB from.

**Returns:** A reference of this OBB.

### .getSize( target : Vector3 ) : Vector3

Returns the size of this OBB.

**target**

The target vector that is used to store the method's result.

**Returns:** The size.

### .intersectRay( ray : Ray, target : Vector3 ) : Vector3

Performs a ray/OBB intersection test and stores the intersection point in the given 3D vector.

**ray**

The ray to test.

**target**

The target vector that is used to store the method's result.

**Returns:** The intersection point. If no intersection is detected, `null` is returned.

### .intersectsBox3( box3 : Box3 ) : boolean

Returns `true` if the given AABB intersects this OBB.

**box3**

The AABB to test.

**Returns:**

*   Whether the given AABB intersects this OBB or not.

### .intersectsOBB( obb : OBB, epsilon : number ) : boolean

Returns `true` if the given OBB intersects this OBB.

**obb**

The OBB to test.

**epsilon**

A small value to prevent arithmetic errors.

Default is `Number.EPSILON`.

**Returns:**

*   Whether the given OBB intersects this OBB or not.

### .intersectsPlane( plane : Plane ) : boolean

Returns `true` if the given plane intersects this OBB.

**plane**

The plane to test.

**Returns:** Whether the given plane intersects this OBB or not.

### .intersectsRay( ray : Ray ) : boolean

Returns `true` if the given ray intersects this OBB.

**ray**

The ray to test.

**Returns:** Whether the given ray intersects this OBB or not.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if the given bounding sphere intersects this OBB.

**sphere**

The bounding sphere to test.

**Returns:**

*   Whether the given bounding sphere intersects this OBB or not.

### .set( center : Vector3, halfSize : Vector3, rotation : Matrix3 ) : OBB

Sets the OBBs components to the given values.

**center**

The center of the OBB.

**halfSize**

Positive halfwidth extents of the OBB along each axis.

**rotation**

The rotation of the OBB.

**Returns:** A reference to this OBB.

## Source

[examples/jsm/math/OBB.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/math/OBB.js)