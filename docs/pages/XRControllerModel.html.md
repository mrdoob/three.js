*Inheritance: EventDispatcher → Object3D →*

# XRControllerModel

Represents a XR controller model.

## Constructor

### new XRControllerModel()

Constructs a new XR controller model.

## Properties

### .envMap : Texture

The controller's environment map.

Default is `null`.

### .motionController : MotionController

The motion controller.

Default is `null`.

## Methods

### .setEnvironmentMap( envMap : Texture ) : XRControllerModel

Sets an environment map that is applied to the controller model.

**envMap**

The environment map to apply.

**Returns:** A reference to this instance.

### .updateMatrixWorld( force : boolean )

Overwritten with a custom implementation. Polls data from the XRInputSource and updates the model's components to match the real world data.

**force**

When set to `true`, a recomputation of world matrices is forced even when [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) is set to `false`.

Default is `false`.

**Overrides:** [Object3D#updateMatrixWorld](Object3D.html#updateMatrixWorld)

## Source

[examples/jsm/webxr/XRControllerModelFactory.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/XRControllerModelFactory.js)