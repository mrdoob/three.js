*Inheritance: EventDispatcher → Controls →*

# FlyControls

This class enables a navigation similar to fly modes in DCC tools like Blender. You can arbitrarily transform the camera in 3D space without any limitations (e.g. focus on a specific target).

## Import

FlyControls is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { FlyControls } from 'three/addons/controls/FlyControls.js';
```

## Constructor

### new FlyControls( object : Object3D, domElement : HTMLElement )

Constructs a new controls instance.

**object**

The object that is managed by the controls.

**domElement**

The HTML element used for event listeners.

Default is `null`.

## Properties

### .autoForward : boolean

If set to `true`, the camera automatically moves forward (and does not stop) when initially translated.

Default is `false`.

### .dragToLook : boolean

If set to `true`, you can only look around by performing a drag interaction.

Default is `false`.

### .movementSpeed : number

The movement speed.

Default is `1`.

### .rollSpeed : number

The rotation speed.

Default is `0.005`.

## Events

### .change

Fires when the camera has been transformed by the controls.

##### Type:

*   Object

## Source

[examples/jsm/controls/FlyControls.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/FlyControls.js)