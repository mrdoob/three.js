*Inheritance: EventDispatcher → Node → TempNode → PassNode →*

# StereoPassNode

A special render pass node that renders the scene as a stereoscopic image.

## Import

StereoPassNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { stereoPass } from 'three/addons/tsl/display/StereoPassNode.js';
```

## Constructor

### new StereoPassNode( scene : Scene, camera : Camera )

Constructs a new stereo pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

## Properties

### .isStereoPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .stereo : StereoCamera

The internal stereo camera that is used to render the scene.

## Methods

### .updateBefore( frame : NodeFrame )

This method is used to render the stereo effect once per frame.

**frame**

The current node frame.

**Overrides:** [PassNode#updateBefore](PassNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/StereoPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/StereoPassNode.js)