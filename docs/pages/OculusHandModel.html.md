*Inheritance: EventDispatcher → Object3D →*

# OculusHandModel

Represents an Oculus hand model.

## Import

OculusHandModel is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OculusHandModel } from 'three/addons/webxr/OculusHandModel.js';
```

## Constructor

### new OculusHandModel( controller : Group, loader : Loader, onLoad : function )

Constructs a new Oculus hand model.

**controller**

The hand controller.

**loader**

A loader that is used to load hand models.

Default is `null`.

**onLoad**

A callback that is executed when a hand model has been loaded.

Default is `null`.

## Properties

### .controller : Group

The hand controller.

### .envMap : Texture

The model's environment map.

Default is `null`.

### .loader : Loader

A loader that is used to load hand models.

Default is `null`.

### .mesh : Mesh

The model mesh.

Default is `null`.

### .motionController : MotionController

The motion controller.

Default is `null`.

### .onLoad : function

A callback that is executed when a hand model has been loaded.

Default is `null`.

### .path : string

The path to the model repository.

Default is `null`.

## Methods

### .checkButton( button : Object )

Executed actions depending on the interaction state with the given button.

**button**

The button.

### .getPointerPosition() : Vector3

Returns the pointer position which is the position of the index finger tip.

**Returns:** The pointer position. Returns `null` if not index finger tip joint was found.

### .intersectBoxObject( boxObject : Mesh ) : boolean

Returns `true` if the current pointer position (the index finger tip) intersections with the given box object.

**boxObject**

The box object.

**Returns:** Whether an intersection was found or not.

### .updateMatrixWorld( force : boolean )

Overwritten with a custom implementation. Makes sure the motion controller updates the mesh.

**force**

When set to `true`, a recomputation of world matrices is forced even when [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) is set to `false`.

Default is `false`.

**Overrides:** [Object3D#updateMatrixWorld](Object3D.html#updateMatrixWorld)

## Source

[examples/jsm/webxr/OculusHandModel.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/OculusHandModel.js)