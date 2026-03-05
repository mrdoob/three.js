*Inheritance: EventDispatcher → Controls →*

# PointerLockControls

The implementation of this class is based on the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API). `PointerLockControls` is a perfect choice for first person 3D games.

## Code Example

```js
const controls = new PointerLockControls( camera, document.body );
// add event listener to show/hide a UI (e.g. the game's menu)
controls.addEventListener( 'lock', function () {
	menu.style.display = 'none';
} );
controls.addEventListener( 'unlock', function () {
	menu.style.display = 'block';
} );
```

## Import

PointerLockControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
```

## Constructor

### new PointerLockControls( camera : Camera, domElement : HTMLElement )

Constructs a new controls instance.

**camera**

The camera that is managed by the controls.

**domElement**

The HTML element used for event listeners.

Default is `null`.

## Properties

### .isLocked : boolean (readonly)

Whether the controls are locked or not.

Default is `false`.

### .maxPolarAngle : number

Camera pitch, upper limit. Range is '\[0, Math.PI\]' in radians.

Default is `Math.PI`.

### .minPolarAngle : number

Camera pitch, lower limit. Range is '\[0, Math.PI\]' in radians.

Default is `0`.

### .pointerSpeed : number

Multiplier for how much the pointer movement influences the camera rotation.

Default is `1`.

## Methods

### .getDirection( v : Vector3 ) : Vector3

Returns the look direction of the camera.

**v**

The target vector that is used to store the method's result.

**Returns:** The normalized direction vector.

### .lock( unadjustedMovement : boolean )

Activates the pointer lock.

**unadjustedMovement**

Disables OS-level adjustment for mouse acceleration, and accesses raw mouse input instead. Setting it to true will disable mouse acceleration.

Default is `false`.

### .moveForward( distance : number )

Moves the camera forward parallel to the xz-plane. Assumes camera.up is y-up.

**distance**

The signed distance.

### .moveRight( distance : number )

Moves the camera sidewards parallel to the xz-plane.

**distance**

The signed distance.

### .unlock()

Exits the pointer lock.

## Events

### .change

Fires when the user moves the mouse.

##### Type:

*   Object

### .lock

Fires when the pointer lock status is "locked" (in other words: the mouse is captured).

##### Type:

*   Object

### .unlock

Fires when the pointer lock status is "unlocked" (in other words: the mouse is not captured anymore).

##### Type:

*   Object

## Source

[examples/jsm/controls/PointerLockControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/PointerLockControls.js)