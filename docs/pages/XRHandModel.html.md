*Inheritance: EventDispatcher → Object3D →*

# XRHandModel

Represents a XR hand model.

## Constructor

### new XRHandModel( controller : Group )

Constructs a new XR hand model.

**controller**

The hand controller.

## Properties

### .controller : Group

The hand controller.

### .envMap : Texture

The controller's environment map.

Default is `null`.

### .mesh : Mesh

The model mesh.

Default is `null`.

### .motionController : MotionController

The motion controller.

Default is `null`.

## Methods

### .updateMatrixWorld( force : boolean )

Overwritten with a custom implementation. Makes sure the motion controller updates the mesh.

**force**

When set to `true`, a recomputation of world matrices is forced even when [Object3D#matrixWorldAutoUpdate](Object3D.html#matrixWorldAutoUpdate) is set to `false`.

Default is `false`.

**Overrides:** [Object3D#updateMatrixWorld](Object3D.html#updateMatrixWorld)

## Source

[examples/jsm/webxr/XRHandModelFactory.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/XRHandModelFactory.js)