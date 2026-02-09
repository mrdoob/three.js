*Inheritance: EventDispatcher → Node → TempNode → PassNode → StereoCompositePassNode →*

# AnaglyphPassNode

A render pass node that creates an anaglyph effect.

## Import

AnaglyphPassNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { anaglyphPass } from 'three/addons/tsl/display/AnaglyphPassNode.js';
```

## Constructor

### new AnaglyphPassNode( scene : Scene, camera : Camera )

Constructs a new anaglyph pass node.

**scene**

The scene to render.

**camera**

The camera to render the scene with.

## Properties

### .isAnaglyphPassNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .setup( builder : NodeBuilder ) : PassTextureNode

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [StereoCompositePassNode#setup](StereoCompositePassNode.html#setup)

## Source

[examples/jsm/tsl/display/AnaglyphPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/AnaglyphPassNode.js)