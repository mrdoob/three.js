*Inheritance: EventDispatcher → Node → TempNode →*

# TransitionNode

Post processing node for creating a transition effect between scenes.

## Import

TransitionNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { transition } from 'three/addons/tsl/display/TransitionNode.js';
```

## Constructor

### new TransitionNode( textureNodeA : TextureNode, textureNodeB : TextureNode, mixTextureNode : TextureNode, mixRatioNode : Node.<float>, thresholdNode : Node.<float>, useTextureNode : Node.<float> )

Constructs a new transition node.

**textureNodeA**

A texture node that represents the beauty pass of the first scene.

**textureNodeB**

A texture node that represents the beauty pass of the second scene.

**mixTextureNode**

A texture node that defines how the transition effect should look like.

**mixRatioNode**

The interpolation factor that controls the mix.

**thresholdNode**

Can be used to tweak the linear interpolation.

**useTextureNode**

Whether `mixTextureNode` should influence the transition or not.

## Properties

### .mixRatioNode : Node.<float>

The interpolation factor that controls the mix.

### .mixTextureNode : TextureNode

A texture that defines how the transition effect should look like.

### .textureNodeA : TextureNode

A texture node that represents the beauty pass of the first scene.

### .textureNodeB : TextureNode

A texture node that represents the beauty pass of the second scene.

### .thresholdNode : Node.<float>

Can be used to tweak the linear interpolation.

### .useTextureNode : Node.<float>

Whether `mixTextureNode` should influence the transition or not.

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

## Source

[examples/jsm/tsl/display/TransitionNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/TransitionNode.js)