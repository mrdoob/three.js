*Inheritance: LightingModel →*

# ShadowMaskModel

Represents lighting model for a shadow material. Used in [ShadowNodeMaterial](ShadowNodeMaterial.html).

## Constructor

### new ShadowMaskModel()

Constructs a new shadow mask model.

## Properties

### .shadowNode : Node

The shadow mask node.

## Methods

### .direct( input : Object )

Only used to save the shadow mask.

**input**

The input data.

**Overrides:** [LightingModel#direct](LightingModel.html#direct)

### .finish( builder : NodeBuilder )

Uses the shadow mask to produce the final color.

**builder**

The current node builder.

**Overrides:** [LightingModel#finish](LightingModel.html#finish)

## Source

[src/nodes/functions/ShadowMaskModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/functions/ShadowMaskModel.js)