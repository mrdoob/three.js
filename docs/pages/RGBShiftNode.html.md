*Inheritance: EventDispatcher → Node → TempNode →*

# RGBShiftNode

Post processing node for shifting/splitting RGB color channels. The effect separates color channels and offsets them from each other.

## Import

RGBShiftNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { rgbShift } from 'three/addons/tsl/display/RGBShiftNode.js';
```

## Constructor

### new RGBShiftNode( textureNode : TextureNode, amount : number, angle : number )

Constructs a new RGB shift node.

**textureNode**

The texture node that represents the input of the effect.

**amount**

The amount of the RGB shift.

Default is `0.005`.

**angle**

Defines the orientation in which colors are shifted.

Default is `0`.

## Properties

### .amount : UniformNode.<float>

The amount of the RGB shift.

### .angle : UniformNode.<float>

Defines in which direction colors are shifted.

### .textureNode : TextureNode

The texture node that represents the input of the effect.

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

## Source

[examples/jsm/tsl/display/RGBShiftNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/RGBShiftNode.js)