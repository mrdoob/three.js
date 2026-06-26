*Inheritance: EventDispatcher → Controls →*

# OrbitControls

Orbit controls allow the camera to orbit around a target.

OrbitControls performs orbiting, dollying (zooming), and panning. Unlike [TrackballControls](TrackballControls.html), it maintains the "up" direction `object.up` (+Y by default).

*   Orbit: Left mouse / touch: one-finger move.
*   Zoom: Middle mouse, or mousewheel / touch: two-finger spread or squish.
*   Pan: Right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move.

## Code Example

```js
const controls = new OrbitControls( camera, renderer.domElement );
// controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 20, 100 );
controls.update();
function animate() {
	// required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();
	renderer.render( scene, camera );
}
```

## Import

OrbitControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
```

## Constructor

### new OrbitControls( object : Object3D, domElement : HTMLElement )

Constructs a new controls instance.

**object**

The object that is managed by the controls.

**domElement**

The HTML element used for event listeners.

Default is `null`.

## Properties

### .autoRotate : boolean

Set to true to automatically rotate around the target

Note that if this is enabled, you must call `update()` in your animation loop. If you want the auto-rotate speed to be independent of the frame rate (the refresh rate of the display), you must pass the time `deltaTime`, in seconds, to `update()`.

Default is `false`.

### .autoRotateSpeed : number

How fast to rotate around the target if `autoRotate` is `true`. The default equates to 30 seconds per orbit at 60fps.

Note that if `autoRotate` is enabled, you must call `update()` in your animation loop.

Default is `2`.

### .cursor : Vector3

The focus point of the `minTargetRadius` and `maxTargetRadius` limits. It can be updated manually at any point to change the center of interest for the `target`.

### .cursorStyle : 'auto' | 'grab'

Defines the visual representation of the cursor.

Default is `'auto'`.

### .dampingFactor : number

The damping inertia used if `enableDamping` is set to `true`.

Note that for this to work, you must call `update()` in your animation loop.

Default is `0.05`.

### .enableDamping : boolean

Set to `true` to enable damping (inertia), which can be used to give a sense of weight to the controls. Note that if this is enabled, you must call `update()` in your animation loop.

Default is `false`.

### .enablePan : boolean

Enable or disable camera panning.

Default is `true`.

### .enableRotate : boolean

Enable or disable horizontal and vertical rotation of the camera.

Note that it is possible to disable a single axis by setting the min and max of the `minPolarAngle` or `minAzimuthAngle` to the same value, which will cause the vertical or horizontal rotation to be fixed at that value.

Default is `true`.

### .enableZoom : boolean

Enable or disable zooming (dollying) of the camera.

Default is `true`.

### .keyPanSpeed : number

How fast to pan the camera when the keyboard is used in pixels per keypress.

Default is `7`.

### .keyRotateSpeed : number

How fast to rotate the camera when the keyboard is used.

Default is `1`.

### .keys : Object

This object contains references to the keycodes for controlling camera panning.

```js
controls.keys = {
	LEFT: 'ArrowLeft', //left arrow
	UP: 'ArrowUp', // up arrow
	RIGHT: 'ArrowRight', // right arrow
	BOTTOM: 'ArrowDown' // down arrow
}
```

**Overrides:** [Controls#keys](Controls.html#keys)

### .maxAzimuthAngle : number

How far you can orbit horizontally, upper limit. If set, the interval `[ min, max ]` must be a sub-interval of `[ - 2 PI, 2 PI ]`, with `( max - min < 2 PI )`.

Default is `-Infinity`.

### .maxDistance : number

How far you can dolly out (perspective camera only).

Default is `Infinity`.

### .maxPolarAngle : number

How far you can orbit vertically, upper limit. Range is `[0, Math.PI]` radians.

Default is `Math.PI`.

### .maxTargetRadius : number

How far you can move the target from the 3D `cursor`.

Default is `Infinity`.

### .maxZoom : number

How far you can zoom out (orthographic camera only).

Default is `Infinity`.

### .minAzimuthAngle : number

How far you can orbit horizontally, lower limit. If set, the interval `[ min, max ]` must be a sub-interval of `[ - 2 PI, 2 PI ]`, with `( max - min < 2 PI )`.

Default is `-Infinity`.

### .minDistance : number

How far you can dolly in (perspective camera only).

Default is `0`.

### .minPolarAngle : number

How far you can orbit vertically, lower limit. Range is `[0, Math.PI]` radians.

Default is `0`.

### .minTargetRadius : number

How close you can get the target to the 3D `cursor`.

Default is `0`.

### .minZoom : number

How far you can zoom in (orthographic camera only).

Default is `0`.

### .mouseButtons : Object

This object contains references to the mouse actions used by the controls.

```js
controls.mouseButtons = {
	LEFT: THREE.MOUSE.ROTATE,
	MIDDLE: THREE.MOUSE.DOLLY,
	RIGHT: THREE.MOUSE.PAN
}
```

**Overrides:** [Controls#mouseButtons](Controls.html#mouseButtons)

### .panSpeed : number

Speed of panning.

Default is `1`.

### .position0 : Vector3

Used internally by `saveState()` and `reset()`.

### .rotateSpeed : number

Speed of rotation.

Default is `1`.

### .screenSpacePanning : boolean

Defines how the camera's position is translated when panning. If `true`, the camera pans in screen space. Otherwise, the camera pans in the plane orthogonal to the camera's up direction.

Default is `true`.

### .target : Vector3

The focus point of the controls, the `object` orbits around this. It can be updated manually at any point to change the focus of the controls.

### .target0 : Vector3

Used internally by `saveState()` and `reset()`.

### .touches : Object

This object contains references to the touch actions used by the controls.

```js
controls.mouseButtons = {
	ONE: THREE.TOUCH.ROTATE,
	TWO: THREE.TOUCH.DOLLY_PAN
}
```

**Overrides:** [Controls#touches](Controls.html#touches)

### .zoom0 : number

Used internally by `saveState()` and `reset()`.

### .zoomSpeed : number

Speed of zooming / dollying.

Default is `1`.

### .zoomToCursor : boolean

Setting this property to `true` allows to zoom to the cursor's position.

Default is `false`.

## Methods

### .dollyIn( dollyScale : number )

Programmatically dolly in (zoom in for perspective camera).

**dollyScale**

The dolly scale factor.

### .dollyOut( dollyScale : number )

Programmatically dolly out (zoom out for perspective camera).

**dollyScale**

The dolly scale factor.

### .getAzimuthalAngle() : number

Get the current horizontal rotation, in radians.

**Returns:** The current horizontal rotation, in radians.

### .getDistance() : number

Returns the distance from the camera to the target.

**Returns:** The distance from the camera to the target.

### .getPolarAngle() : number

Get the current vertical rotation, in radians.

**Returns:** The current vertical rotation, in radians.

### .listenToKeyEvents( domElement : HTMLElement )

Adds key event listeners to the given DOM element. `window` is a recommended argument for using this method.

**domElement**

The DOM element

### .pan( deltaX : number, deltaY : number )

Programmatically pan the camera.

**deltaX**

The horizontal pan amount in pixels.

**deltaY**

The vertical pan amount in pixels.

### .reset()

Reset the controls to their state from either the last time the `saveState()` was called, or the initial state.

### .rotateLeft( angle : number )

Programmatically rotate the camera left (around the vertical axis).

**angle**

The rotation angle in radians.

### .rotateUp( angle : number )

Programmatically rotate the camera up (around the horizontal axis).

**angle**

The rotation angle in radians.

### .saveState()

Save the current state of the controls. This can later be recovered with `reset()`.

### .stopListenToKeyEvents()

Removes the key event listener previously defined with `listenToKeyEvents()`.

## Events

### .change

Fires when the camera has been transformed by the controls.

##### Type:

*   Object

### .end

Fires when an interaction has finished.

##### Type:

*   Object

### .start

Fires when an interaction was initiated.

##### Type:

*   Object

## Source

[examples/jsm/controls/OrbitControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/OrbitControls.js)