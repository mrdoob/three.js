*Inheritance: EventDispatcher → Object3D → Camera →*

# OrthographicCamera

Camera that uses [orthographic projection](https://en.wikipedia.org/wiki/Orthographic_projection).

In this projection mode, an object's size in the rendered image stays constant regardless of its distance from the camera. This can be useful for rendering 2D scenes and UI elements, amongst other things.

## Code Example

```js
const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
scene.add( camera );
```

## Constructor

### new OrthographicCamera( left : number, right : number, top : number, bottom : number, near : number, far : number )

Constructs a new orthographic camera.

**left**

The left plane of the camera's frustum.

Default is `-1`.

**right**

The right plane of the camera's frustum.

Default is `1`.

**top**

The top plane of the camera's frustum.

Default is `1`.

**bottom**

The bottom plane of the camera's frustum.

Default is `-1`.

**near**

The camera's near plane.

Default is `0.1`.

**far**

The camera's far plane.

Default is `2000`.

## Properties

### .bottom : number

The bottom plane of the camera's frustum.

Default is `-1`.

### .far : number

The camera's far plane. Must be greater than the current value of [OrthographicCamera#near](OrthographicCamera.html#near).

Default is `2000`.

### .isOrthographicCamera : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .left : number

The left plane of the camera's frustum.

Default is `-1`.

### .near : number

The camera's near plane. The valid range is greater than `0` and less than the current value of [OrthographicCamera#far](OrthographicCamera.html#far).

Note that, unlike for the [PerspectiveCamera](PerspectiveCamera.html), `0` is a valid value for an orthographic camera's near plane.

Default is `0.1`.

### .right : number

The right plane of the camera's frustum.

Default is `1`.

### .top : number

The top plane of the camera's frustum.

Default is `1`.

### .view : Object

Represents the frustum window specification. This property should not be edited directly but via [PerspectiveCamera#setViewOffset](PerspectiveCamera.html#setViewOffset) and [PerspectiveCamera#clearViewOffset](PerspectiveCamera.html#clearViewOffset).

Default is `null`.

### .zoom : number

The zoom factor of the camera.

Default is `1`.

## Methods

### .clearViewOffset()

Removes the view offset from the projection matrix.

### .setViewOffset( fullWidth : number, fullHeight : number, x : number, y : number, width : number, height : number )

Sets an offset in a larger frustum. This is useful for multi-window or multi-monitor/multi-machine setups.

**fullWidth**

The full width of multiview setup.

**fullHeight**

The full height of multiview setup.

**x**

The horizontal offset of the subcamera.

**y**

The vertical offset of the subcamera.

**width**

The width of subcamera.

**height**

The height of subcamera.

See:

*   [PerspectiveCamera#setViewOffset](PerspectiveCamera.html#setViewOffset)

### .updateProjectionMatrix()

Updates the camera's projection matrix. Must be called after any change of camera properties.

## Source

[src/cameras/OrthographicCamera.js](https://github.com/mrdoob/three.js/blob/master/src/cameras/OrthographicCamera.js)