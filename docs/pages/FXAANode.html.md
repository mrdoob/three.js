*Inheritance: EventDispatcher → Node → TempNode →*

# FXAANode

Post processing node for applying FXAA. This node requires sRGB input so tone mapping and color space conversion must happen before the anti-aliasing.

## Import

FXAANode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { fxaa } from 'three/addons/tsl/display/FXAANode.js';
```

## Constructor

### new FXAANode( textureNode : TextureNode )

Constructs a new FXAA node.

**textureNode**

The texture node that represents the input of the effect.

## Properties

### .textureNode : TextureNode

The texture node that represents the input of the effect.

### .updateBeforeType : string

The `updateBeforeType` is set to `NodeUpdateType.FRAME` since the node updates its internal uniforms once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateBeforeType](TempNode.html#updateBeforeType)

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .updateBefore( frame : NodeFrame )

This method is used to update the effect's uniforms once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#updateBefore](TempNode.html#updateBefore)

## Source

[examples/jsm/tsl/display/FXAANode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/FXAANode.js)