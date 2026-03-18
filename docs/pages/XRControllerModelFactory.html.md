# XRControllerModelFactory

Allows to create controller models for WebXR controllers that can be added as a visual representation to your scene. `XRControllerModelFactory` will automatically fetch controller models that match what the user is holding as closely as possible. The models should be attached to the object returned from getControllerGrip in order to match the orientation of the held device.

This module depends on the [motion-controllers](https://github.com/immersive-web/webxr-input-profiles/blob/main/packages/motion-controllers/README.md) third-part library.

## Code Example

```js
const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip = renderer.xr.getControllerGrip( 0 );
controllerGrip.add( controllerModelFactory.createControllerModel( controllerGrip ) );
scene.add( controllerGrip );
```

## Import

XRControllerModelFactory is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
```

## Constructor

### new XRControllerModelFactory( gltfLoader : GLTFLoader, onLoad : function )

Constructs a new XR controller model factory.

**gltfLoader**

A glTF loader that is used to load controller models.

Default is `null`.

**onLoad**

A callback that is executed when a controller model has been loaded.

Default is `null`.

## Properties

### .gltfLoader : GLTFLoader

A glTF loader that is used to load controller models.

Default is `null`.

### .onLoad : function

A callback that is executed when a controller model has been loaded.

Default is `null`.

### .path : string

The path to the model repository.

## Methods

### .createControllerModel( controller : Group ) : XRControllerModel

Creates a controller model for the given WebXR controller.

**controller**

The controller.

**Returns:** The XR controller model.

### .setPath( path : string ) : XRControllerModelFactory

Sets the path to the model repository.

**path**

The path to set.

**Returns:** A reference to this instance.

## Source

[examples/jsm/webxr/XRControllerModelFactory.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/webxr/XRControllerModelFactory.js)