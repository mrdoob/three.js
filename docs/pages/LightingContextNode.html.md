*Inheritance: EventDispatcher → Node → ContextNode →*

# LightingContextNode

`LightingContextNode` represents an extension of the [ContextNode](ContextNode.html) module by adding lighting specific context data. It represents the runtime context of [LightsNode](LightsNode.html).

## Constructor

### new LightingContextNode( lightsNode : LightsNode, lightingModel : LightingModel, backdropNode : Node.<vec3>, backdropAlphaNode : Node.<float> )

Constructs a new lighting context node.

**lightsNode**

The lights node.

**lightingModel**

The current lighting model.

Default is `null`.

**backdropNode**

A backdrop node.

Default is `null`.

**backdropAlphaNode**

A backdrop alpha node.

Default is `null`.

## Properties

### .backdropAlphaNode : Node.<float>

A backdrop alpha node.

Default is `null`.

### .backdropNode : Node.<vec3>

A backdrop node.

Default is `null`.

### .lightingModel : LightingModel

The current lighting model.

Default is `null`.

## Methods

### .getContext() : Object

Returns a lighting context object.

**Returns:** The lighting context object.

## Source

[src/nodes/lighting/LightingContextNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/LightingContextNode.js)