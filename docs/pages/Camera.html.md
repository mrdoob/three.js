*Inheritance: EventDispatcher → Object3D →*

# Camera

Abstract base class for cameras. This class should always be inherited when you build a new camera.

## Constructor

### new Camera() (abstract)

Constructs a new camera.

## Properties

### .coordinateSystem : WebGLCoordinateSystem | WebGPUCoordinateSystem

The coordinate system in which the camera is used.

### .isCamera : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .matrixWorldInverse : Matrix4

The inverse of the camera's world matrix.

### .projectionMatrix : Matrix4

The camera's projection matrix.

### .projectionMatrixInverse : Matrix4

The inverse of the camera's projection matrix.

### .reversedDepth : boolean

The flag that indicates whether the camera uses a reversed depth buffer.

Default is `false`.

## Methods

### .getWorldDirection( target : Vector3 ) : Vector3

Returns a vector representing the ("look") direction of the 3D object in world space.

This method is overwritten since cameras have a different forward vector compared to other 3D objects. A camera looks down its local, negative z-axis by default.

**target**

The target vector the result is stored to.

**Overrides:** [Object3D#getWorldDirection](Object3D.html#getWorldDirection)

**Returns:** The 3D object's direction in world space.

## Source

[src/cameras/Camera.js](https://github.com/mrdoob/three.js/blob/master/src/cameras/Camera.js)