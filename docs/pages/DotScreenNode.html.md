*Inheritance: EventDispatcher → Node → TempNode →*

# DotScreenNode

Post processing node for creating dot-screen effect.

## Import

DotScreenNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { dotScreen } from 'three/addons/tsl/display/DotScreenNode.js';
```

## Constructor

### new DotScreenNode( inputNode : Node, angle : number, scale : number )

Constructs a new dot screen node.

**inputNode**

The node that represents the input of the effect.

**angle**

The rotation of the effect in radians.

Default is `1.57`.

**scale**

The scale of the effect. A higher value means smaller dots.

Default is `1`.

## Properties

### .angle : UniformNode.<float>

A uniform node that represents the rotation of the effect in radians.

### .inputNode : Node

The node that represents the input of the effect.

### .scale : UniformNode.<float>

A uniform node that represents the scale of the effect. A higher value means smaller dots.

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

## Source

[examples/jsm/tsl/display/DotScreenNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/DotScreenNode.js)