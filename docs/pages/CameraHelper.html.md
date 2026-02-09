*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# CameraHelper

This helps with visualizing what a camera contains in its frustum. It visualizes the frustum of a camera using a line segments.

Based on frustum visualization in [lightgl.js shadowmap example](https://github.com/evanw/lightgl.js/blob/master/tests/shadowmap.html).

`CameraHelper` must be a child of the scene.

## Code Example

```js
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const helper = new THREE.CameraHelper( camera );
scene.add( helper );
```

## Constructor

### new CameraHelper( camera : Camera )

Constructs a new arrow helper.

**camera**

The camera to visualize.

## Properties

### .camera : Camera

The camera being visualized.

### .pointMap : Object.<string, Array.<number>>

This contains the points used to visualize the camera.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .setColors( frustum : Color, cone : Color, up : Color, target : Color, cross : Color ) : CameraHelper

Defines the colors of the helper.

**frustum**

The frustum line color.

**cone**

The cone line color.

**up**

The up line color.

**target**

The target line color.

**cross**

The cross line color.

**Returns:** A reference to this helper.

### .update()

Updates the helper based on the projection matrix of the camera.

## Source

[src/helpers/CameraHelper.js](https://github.com/mrdoob/three.js/blob/master/src/helpers/CameraHelper.js)