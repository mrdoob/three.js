*Inheritance: EventDispatcher → Node → TempNode →*

# ChromaticAberrationNode

Post processing node for applying chromatic aberration effect. This effect simulates the color fringing that occurs in real camera lenses by separating and offsetting the red, green, and blue channels.

## Import

ChromaticAberrationNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { chromaticAberration } from 'three/addons/tsl/display/ChromaticAberrationNode.js';
```

## Constructor

### new ChromaticAberrationNode( textureNode : TextureNode, strengthNode : Node, centerNode : Node, scaleNode : Node )

Constructs a new chromatic aberration node.

**textureNode**

The texture node that represents the input of the effect.

**strengthNode**

The strength of the chromatic aberration effect as a node.

**centerNode**

The center point of the effect as a node.

**scaleNode**

The scale factor for stepped scaling from center as a node.

## Properties

### .centerNode : Node

A node holding the center point of the effect.

### .scaleNode : Node

A node holding the scale factor for stepped scaling.

### .strengthNode : Node

A node holding the strength of the effect.

### .textureNode : texture

The texture node that represents the input of the effect.

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

## Source

[examples/jsm/tsl/display/ChromaticAberrationNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/ChromaticAberrationNode.js)