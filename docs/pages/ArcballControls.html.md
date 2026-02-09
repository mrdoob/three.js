*Inheritance: EventDispatcher → Controls →*

# ArcballControls

Arcball controls allow the camera to be controlled by a virtual trackball with full touch support and advanced navigation functionality. Cursor/finger positions and movements are mapped over a virtual trackball surface represented by a gizmo and mapped in intuitive and consistent camera movements. Dragging cursor/fingers will cause camera to orbit around the center of the trackball in a conservative way (returning to the starting point will make the camera return to its starting orientation).

In addition to supporting pan, zoom and pinch gestures, Arcball controls provide focus< functionality with a double click/tap for intuitively moving the object's point of interest in the center of the virtual trackball. Focus allows a much better inspection and navigation in complex environment. Moreover Arcball controls allow FOV manipulation (in a vertigo-style method) and z-rotation. Saving and restoring of Camera State is supported also through clipboard (use ctrl+c and ctrl+v shortcuts for copy and paste the state).

Unlike [OrbitControls](OrbitControls.html) and [TrackballControls](TrackballControls.html), `ArcballControls` doesn't require `update()` to be called externally in an animation loop when animations are on.

## Import

ArcballControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';
```

## Constructor

### new ArcballControls( camera : Camera, domElement : HTMLElement, scene : Scene )

Constructs a new controls instance.

**camera**

The camera to be controlled. The camera must not be a child of another object, unless that object is the scene itself.

**domElement**

The HTML element used for event listeners.

Default is `null`.

**scene**

The scene rendered by the camera. If not given, gizmos cannot be shown.

Default is `null`.

## Properties

### .adjustNearFar : boolean

If set to `true`, the camera's near and far values will be adjusted every time zoom is performed trying to maintain the same visible portion given by initial near and far values. Only works with perspective cameras.

Default is `false`.

### .cursorZoom : boolean

Set to `true` to make zoom become cursor centered.

Default is `false`.

### .dampingFactor : number

The damping inertia used if 'enableAnimations`is set to`true\`.

Default is `25`.

### .enableAnimations : boolean

Set to `true` to enable animations for rotation (damping) and focus operation.

Default is `true`.

### .enableFocus : boolean

Enable or disable camera focusing on double-tap (or click) operations.

Default is `true`.

### .enableGizmos : boolean

Enable or disable gizmos.

Default is `true`.

### .enableGrid : boolean

If set to `true`, a grid will appear when panning operation is being performed (desktop interaction only).

Default is `false`.

### .enablePan : boolean

Enable or disable camera panning.

Default is `true`.

### .enableRotate : boolean

Enable or disable camera rotation.

Default is `true`.

### .enableZoom : boolean

Enable or disable camera zoom.

Default is `true`.

### .focusAnimationTime : number

Duration of focus animations in ms.

Default is `500`.

### .maxDistance : number

How far you can dolly out. For perspective cameras only.

Default is `Infinity`.

### .maxFov : number

The maximum FOV in degrees.

Default is `90`.

### .maxZoom : number

How far you can zoom out. For orthographic cameras only.

Default is `Infinity`.

### .minDistance : number

How far you can dolly in. For perspective cameras only.

Default is `0`.

### .minFov : number

The minimum FOV in degrees.

Default is `5`.

### .minZoom : number

How far you can zoom in. For orthographic cameras only.

Default is `0`.

### .mouseActions : Array.<Object>

Holds the mouse actions of this controls. This property is maintained by the methods `setMouseAction()` and `unsetMouseAction()`.

### .radiusFactor : number

The size of the gizmo relative to the screen width and height.

Default is `0.67`.

### .rotateSpeed : number

Speed of rotation.

Default is `1`.

### .scaleFactor : number

The scaling factor used when performing zoom operation.

Default is `1.1`.

### .scene : Scene

The scene rendered by the camera. If not given, gizmos cannot be shown.

Default is `null`.

### .target : Vector3

The control's focus point.

### .wMax : number

Maximum angular velocity allowed on rotation animation start.

Default is `20`.

## Methods

### .activateGizmos( isActive : boolean )

Makes rotation gizmos more or less visible.

**isActive**

If set to `true`, gizmos are more visible.

### .copyState()

Copy the current state to clipboard (as a readable JSON text).

### .disposeGrid()

Removes the grid from the scene.

### .getRaycaster() : Raycaster

Returns the raycaster that is used for user interaction. This object is shared between all instances of `ArcballControls`.

**Returns:** The internal raycaster.

### .pasteState()

Set the controls state from the clipboard, assumes that the clipboard stores a JSON text as saved from `copyState()`.

### .reset()

Resets the controls.

### .saveState()

Saves the current state of the control. This can later be recover with `reset()`.

### .setCamera( camera : Camera )

Sets the camera to be controlled. Must be called in order to set a new camera to be controlled.

**camera**

The camera to be controlled.

### .setGizmosVisible( value : boolean )

Sets gizmos visibility.

**value**

Value of gizmos visibility.

### .setMouseAction( operation : 'PAN' | 'ROTATE' | 'ZOOM' | 'FOV', mouse : 0 | 1 | 2 | 'WHEEL', key : 'CTRL' | 'SHIFT' ) : boolean

Set a new mouse action by specifying the operation to be performed and a mouse/key combination. In case of conflict, replaces the existing one.

**operation**

The operation to be performed ('PAN', 'ROTATE', 'ZOOM', 'FOV').

**mouse**

A mouse button (0, 1, 2) or 'WHEEL' for wheel notches.

**key**

The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed.

Default is `null`.

**Returns:** `true` if the mouse action has been successfully added, `false` otherwise.

### .setTbRadius( value : number )

Sets gizmos radius factor and redraws gizmos.

**value**

Value of radius factor.

### .unsetMouseAction( mouse : 0 | 1 | 2 | 'WHEEL', key : 'CTRL' | 'SHIFT' ) : boolean

Remove a mouse action by specifying its mouse/key combination.

**mouse**

A mouse button (0, 1, 2) or 'WHEEL' for wheel notches.

**key**

The keyboard modifier ('CTRL', 'SHIFT') or null if key is not needed.

Default is `null`.

**Returns:** `true` if the operation has been successfully removed, `false` otherwise.

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

[examples/jsm/controls/ArcballControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/ArcballControls.js)