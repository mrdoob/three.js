*Inheritance: EventDispatcher → Node → TempNode →*

# Lut3DNode

A post processing node for color grading via lookup tables.

## Import

Lut3DNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { lut3D } from 'three/addons/tsl/display/Lut3DNode.js';
```

## Constructor

### new Lut3DNode( inputNode : Node, lutNode : TextureNode, size : number, intensityNode : Node.<float> )

Constructs a new LUT node.

**inputNode**

The node that represents the input of the effect.

**lutNode**

A texture node that represents the lookup table.

**size**

The size of the lookup table.

**intensityNode**

Controls the intensity of the effect.

## Properties

### .inputNode : Node

The node that represents the input of the effect.

### .intensityNode : Node.<float>

Controls the intensity of the effect.

### .lutNode : TextureNode

A texture node that represents the lookup table.

### .size : UniformNode.<float>

The size of the lookup table.

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

## Source

[examples/jsm/tsl/display/Lut3DNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/Lut3DNode.js)