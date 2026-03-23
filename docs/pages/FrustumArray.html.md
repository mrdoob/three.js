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

### .containsPoint( point : Vector3, cameraArray : Object ) : boolean

Returns `true` if the given point lies within any frustum from the camera array.

**point**

The point to test.

**cameraArray**

An object with a cameras property containing an array of cameras.

**Returns:** Whether the point is visible in any camera.

### .intersectsBox( box : Box3, cameraArray : Object ) : boolean

Returns `true` if the given bounding box is intersecting any frustum from the camera array.

**box**

The bounding box to test.

**cameraArray**

An object with a cameras property containing an array of cameras.

**Returns:** Whether the box is visible in any camera.

### .intersectsObject( object : Object3D, cameraArray : Object ) : boolean

Returns `true` if the 3D object's bounding sphere is intersecting any frustum from the camera array.

**object**

The 3D object to test.

**cameraArray**

An object with a cameras property containing an array of cameras.

**Returns:** Whether the 3D object is visible in any camera.

### .intersectsSphere( sphere : Sphere, cameraArray : Object ) : boolean

Returns `true` if the given bounding sphere is intersecting any frustum from the camera array.

**sphere**

The bounding sphere to test.

**cameraArray**

An object with a cameras property containing an array of cameras.

**Returns:** Whether the sphere is visible in any camera.

### .intersectsSprite( sprite : Sprite, cameraArray : Object ) : boolean

Returns `true` if the given sprite is intersecting any frustum from the camera array.

**sprite**

The sprite to test.

**cameraArray**

An object with a cameras property containing an array of cameras.

**Returns:** Whether the sprite is visible in any camera.

## Source

[src/math/FrustumArray.js](https://github.com/mrdoob/three.js/blob/master/src/math/FrustumArray.js)