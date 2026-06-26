# FrustumArray

FrustumArray is used to determine if an object is visible in at least one camera from an array of cameras. This is particularly useful for multi-view renderers.

## Constructor

### new FrustumArray()

Constructs a new frustum array.

## Properties

### .coordinateSystem : WebGLCoordinateSystem | WebGPUCoordinateSystem

The coordinate system to use.

Default is `WebGLCoordinateSystem`.

## Methods

### .clone() : FrustumArray

Returns a new frustum array with copied values from this instance.

**Returns:** A clone of this instance.

### .containsPoint( point : Vector3 ) : boolean

Returns `true` if the given point lies within any cached frustum.

[FrustumArray#setFromArrayCamera](FrustumArray.html#setFromArrayCamera) must be called once per render before this method.

**point**

The point to test.

**Returns:** Whether the point is visible in any camera.

### .copy( frustumArray : FrustumArray ) : FrustumArray

Copies the values of the given frustum array to this instance.

**frustumArray**

The frustum array to copy.

**Returns:** A reference to this frustum array.

### .intersectsBox( box : Box3 ) : boolean

Returns `true` if the given bounding box is intersecting any cached frustum.

[FrustumArray#setFromArrayCamera](FrustumArray.html#setFromArrayCamera) must be called once per render before this method.

**box**

The bounding box to test.

**Returns:** Whether the box is visible in any camera.

### .intersectsObject( object : Object3D ) : boolean

Returns `true` if the 3D object's bounding sphere is intersecting any cached frustum.

[FrustumArray#setFromArrayCamera](FrustumArray.html#setFromArrayCamera) must be called once per render before this method.

**object**

The 3D object to test.

**Returns:** Whether the 3D object is visible in any camera.

### .intersectsSphere( sphere : Sphere ) : boolean

Returns `true` if the given bounding sphere is intersecting any cached frustum.

[FrustumArray#setFromArrayCamera](FrustumArray.html#setFromArrayCamera) must be called once per render before this method.

**sphere**

The bounding sphere to test.

**Returns:** Whether the sphere is visible in any camera.

### .intersectsSprite( sprite : Sprite ) : boolean

Returns `true` if the given sprite is intersecting any cached frustum.

[FrustumArray#setFromArrayCamera](FrustumArray.html#setFromArrayCamera) must be called once per render before this method.

**sprite**

The sprite to test.

**Returns:** Whether the sprite is visible in any camera.

### .setFromArrayCamera( cameraArray : ArrayCamera ) : FrustumArray

Computes and caches a frustum for each camera of the given array camera.

**cameraArray**

The array camera whose sub-cameras define the frustums.

**Returns:** A reference to this frustum array.

## Source

[src/math/FrustumArray.js](https://github.com/mrdoob/three.js/blob/master/src/math/FrustumArray.js)