# Frustum

Frustums are used to determine what is inside the camera's field of view. They help speed up the rendering process - objects which lie outside a camera's frustum can safely be excluded from rendering.

This class is mainly intended for use internally by a renderer.

## Constructor

### new Frustum( p0 : Plane, p1 : Plane, p2 : Plane, p3 : Plane, p4 : Plane, p5 : Plane )

Constructs a new frustum.

**p0**

The first plane that encloses the frustum.

**p1**

The second plane that encloses the frustum.

**p2**

The third plane that encloses the frustum.

**p3**

The fourth plane that encloses the frustum.

**p4**

The fifth plane that encloses the frustum.

**p5**

The sixth plane that encloses the frustum.

## Properties

### .planes : Array.<Plane>

This array holds the planes that enclose the frustum.

## Methods

### .clone() : Frustum

Returns a new frustum with copied values from this instance.

**Returns:** A clone of this instance.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if the given point lies within the frustum.

**point**

The point to test.

**Returns:** Whether the point lies within this frustum or not.

### .copy( frustum : Frustum ) : Frustum

Copies the values of the given frustum to this instance.

**frustum**

The frustum to copy.

**Returns:** A reference to this frustum.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if the given bounding box is intersecting this frustum.

**box**

The bounding box to test.

**Returns:** Whether the bounding box is intersecting this frustum or not.

### .intersectsObject( object : Object3D ) : boolean

Returns `true` if the 3D object's bounding sphere is intersecting this frustum.

Note that the 3D object must have a geometry so that the bounding sphere can be calculated.

**object**

The 3D object to test.

**Returns:** Whether the 3D object's bounding sphere is intersecting this frustum or not.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if the given bounding sphere is intersecting this frustum.

**sphere**

The bounding sphere to test.

**Returns:** Whether the bounding sphere is intersecting this frustum or not.

### .intersectsSprite( sprite : Sprite ) : boolean

Returns `true` if the given sprite is intersecting this frustum.

**sprite**

The sprite to test.

**Returns:** Whether the sprite is intersecting this frustum or not.

### .set( p0 : Plane, p1 : Plane, p2 : Plane, p3 : Plane, p4 : Plane, p5 : Plane ) : Frustum

Sets the frustum planes by copying the given planes.

**p0**

The first plane that encloses the frustum.

**p1**

The second plane that encloses the frustum.

**p2**

The third plane that encloses the frustum.

**p3**

The fourth plane that encloses the frustum.

**p4**

The fifth plane that encloses the frustum.

**p5**

The sixth plane that encloses the frustum.

**Returns:** A reference to this frustum.

### .setFromProjectionMatrix( m : Matrix4, coordinateSystem : WebGLCoordinateSystem | WebGPUCoordinateSystem, reversedDepth : boolean ) : Frustum

Sets the frustum planes from the given projection matrix.

**m**

The projection matrix.

**coordinateSystem**

The coordinate system.

**reversedDepth**

Whether to use a reversed depth.

Default is `false`.

**Returns:** A reference to this frustum.

## Source

[src/math/Frustum.js](https://github.com/mrdoob/three.js/blob/master/src/math/Frustum.js)