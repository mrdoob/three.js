*Inheritance: EventDispatcher → Controls →*

# FirstPersonControls

This class is an alternative implementation of [FlyControls](FlyControls.html).

## Import

FirstPersonControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
```

## Constructor

### new FirstPersonControls( object : Object3D, domElement : HTMLElement )

Constructs a new controls instance.

**object**

The object that is managed by the controls.

**domElement**

The HTML element used for event listeners.

Default is `null`.

## Properties

### .activeLook : boolean

Whether it's possible to look around or not.

Default is `true`.

### .autoForward : boolean

Whether the camera is automatically moved forward or not.

Default is `false`.

### .constrainVertical : boolean

Whether or not looking around is vertically constrained by `verticalMin` and `verticalMax`.

Default is `false`.

### .heightCoef : number

Determines how much faster the camera moves when it's y-component is near `heightMax`.

Default is `1`.

### .heightMax : number

Upper camera height limit used for movement speed adjustment.

Default is `1`.

### .heightMin : number

Lower camera height limit used for movement speed adjustment.

Default is `0`.

### .heightSpeed : boolean

Whether or not the camera's height influences the forward movement speed. Use the properties `heightCoef`, `heightMin` and `heightMax` for configuration.

Default is `false`.

### .lookSpeed : number

The look around speed.

Default is `0.005`.

### .lookVertical : boolean

Whether it's possible to vertically look around or not.

Default is `true`.

### .mouseDragOn : boolean (readonly)

Whether the mouse is pressed down or not.

Default is `false`.

### .movementSpeed : number

The movement speed.

Default is `1`.

### .verticalMax : number

How far you can vertically look around, upper limit. Range is `0` to `Math.PI` in radians.

Default is `0`.

### .verticalMin : number

How far you can vertically look around, lower limit. Range is `0` to `Math.PI` in radians.

Default is `0`.

## Methods

### .handleResize()

Must be called if the application window is resized.

### .lookAt( x : number | Vector3, y : number, z : number ) : FirstPersonControls

Rotates the camera towards the defined target position.

**x**

The x coordinate of the target position or alternatively a vector representing the target position.

**y**

The y coordinate of the target position.

**z**

The z coordinate of the target position.

**Returns:** A reference to this controls.

## Source

[examples/jsm/controls/FirstPersonControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FirstPersonControls.js)