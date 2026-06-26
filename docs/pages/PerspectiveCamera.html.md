*Inheritance: EventDispatcher → Object3D → Camera →*

# PerspectiveCamera

Camera that uses [perspective projection](https://en.wikipedia.org/wiki/Perspective_\(graphical\)).

This projection mode is designed to mimic the way the human eye sees. It is the most common projection mode used for rendering a 3D scene.

## Code Example

```js
const camera = new THREE.PerspectiveCamera( 45, width / height, 1, 1000 );
scene.add( camera );
```

## Constructor

### new PerspectiveCamera( fov : number, aspect : number, near : number, far : number )

Constructs a new perspective camera.

**fov**

The vertical field of view.

Default is `50`.

**aspect**

The aspect ratio.

Default is `1`.

**near**

The camera's near plane.

Default is `0.1`.

**far**

The camera's far plane.

Default is `2000`.

## Properties

### .aspect : number

The aspect ratio, usually the canvas width / canvas height.

Default is `1`.

### .far : number

The camera's far plane. Must be greater than the current value of [PerspectiveCamera#near](PerspectiveCamera.html#near).

Default is `2000`.

### .filmGauge : number

Film size used for the larger axis. Default is `35` (millimeters). This parameter does not influence the projection matrix unless [PerspectiveCamera#filmOffset](PerspectiveCamera.html#filmOffset) is set to a nonzero value.

Default is `35`.

### .filmOffset : number

Horizontal off-center offset in the same unit as [PerspectiveCamera#filmGauge](PerspectiveCamera.html#filmGauge).

Default is `0`.

### .focus : number

Object distance used for stereoscopy and depth-of-field effects. This parameter does not influence the projection matrix unless a [StereoCamera](StereoCamera.html) is being used.

Default is `10`.

### .fov : number

The vertical field of view, from bottom to top of view, in degrees.

Default is `50`.

### .isPerspectiveCamera : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .near : number

The camera's near plane. The valid range is greater than `0` and less than the current value of [PerspectiveCamera#far](PerspectiveCamera.html#far).

Note that, unlike for the [OrthographicCamera](OrthographicCamera.html), `0` is _not_ a valid value for a perspective camera's near plane.

Default is `0.1`.

### .view : Object

Represents the frustum window specification. This property should not be edited directly but via [PerspectiveCamera#setViewOffset](PerspectiveCamera.html#setViewOffset) and [PerspectiveCamera#clearViewOffset](PerspectiveCamera.html#clearViewOffset).

Default is `null`.

### .zoom : number

The zoom factor of the camera.

Default is `1`.

## Methods

### .clearViewOffset()

Removes the view offset from the projection matrix.

### .getEffectiveFOV() : number

Returns the current vertical field of view angle in degrees considering [PerspectiveCamera#zoom](PerspectiveCamera.html#zoom).

**Returns:** The effective FOV.

### .getFilmHeight() : number

Returns the height of the image on the film. If [PerspectiveCamera#aspect](PerspectiveCamera.html#aspect) is greater than or equal to one (landscape format), the result equals [PerspectiveCamera#filmGauge](PerspectiveCamera.html#filmGauge).

**Returns:** The film width.

### .getFilmWidth() : number

Returns the width of the image on the film. If [PerspectiveCamera#aspect](PerspectiveCamera.html#aspect) is greater than or equal to one (landscape format), the result equals [PerspectiveCamera#filmGauge](PerspectiveCamera.html#filmGauge).

**Returns:** The film width.

### .getFocalLength() : number

Returns the focal length from the current [PerspectiveCamera#fov](PerspectiveCamera.html#fov) and [PerspectiveCamera#filmGauge](PerspectiveCamera.html#filmGauge).

**Returns:** The computed focal length.

### .getViewBounds( distance : number, minTarget : Vector2, maxTarget : Vector2 )

Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction. Sets `minTarget` and `maxTarget` to the coordinates of the lower-left and upper-right corners of the view rectangle.

**distance**

The viewing distance.

**minTarget**

The lower-left corner of the view rectangle is written into this vector.

**maxTarget**

The upper-right corner of the view rectangle is written into this vector.

### .getViewSize( distance : number, target : Vector2 ) : Vector2

Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.

**distance**

The viewing distance.

**target**

The target vector that is used to store result where x is width and y is height.

**Returns:** The view size.

### .setFocalLength( focalLength : number )

Sets the FOV by focal length in respect to the current [PerspectiveCamera#filmGauge](PerspectiveCamera.html#filmGauge).

The default film gauge is 35, so that the focal length can be specified for a 35mm (full frame) camera.

**focalLength**

Values for focal length and film gauge must have the same unit.

### .setViewOffset( fullWidth : number, fullHeight : number, x : number, y : number, width : number, height : number )

Sets an offset in a larger frustum. This is useful for multi-window or multi-monitor/multi-machine setups.

For example, if you have 3x2 monitors and each monitor is 1920x1080 and the monitors are in grid like this

```js
+---+---+---+
  | A | B | C |
  +---+---+---+
  | D | E | F |
  +---+---+---+
```

then for each monitor you would call it like this:

```js
const w = 1920;
const h = 1080;
const fullWidth = w * 3;
const fullHeight = h * 2;
// --A--
camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
// --B--
camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
// --C--
camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
// --D--
camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
// --E--
camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
// --F--
camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
```

Note there is no reason monitors have to be the same size or in a grid.

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

### .updateProjectionMatrix()

Updates the camera's projection matrix. Must be called after any change of camera properties.

## Source

[src/cameras/PerspectiveCamera.js](https://github.com/mrdoob/three.js/blob/master/src/cameras/PerspectiveCamera.js)