*Inheritance: EventDispatcher → Material → NodeMaterial →*

# LineDashedNodeMaterial

Node material version of [LineDashedMaterial](LineDashedMaterial.html).

## Constructor

### new LineDashedNodeMaterial( parameters : Object )

Constructs a new line dashed node material.

**parameters**

The configuration parameter.

## Properties

### .dashOffset : number

The dash offset.

Default is `0`.

### .dashScaleNode : Node.<float>

The scale of dash materials is by default inferred from the `scale` property. This node property allows to overwrite the default and define the scale with a node instead.

If you don't want to overwrite the scale but modify the existing value instead, use [materialLineScale](TSL.html#materialLineScale).

Default is `null`.

### .dashSizeNode : Node.<float>

The dash size of dash materials is by default inferred from the `dashSize` property. This node property allows to overwrite the default and define the dash size with a node instead.

If you don't want to overwrite the dash size but modify the existing value instead, use [materialLineDashSize](TSL.html#materialLineDashSize).

Default is `null`.

### .gapSizeNode : Node.<float>

The gap size of dash materials is by default inferred from the `gapSize` property. This node property allows to overwrite the default and define the gap size with a node instead.

If you don't want to overwrite the gap size but modify the existing value instead, use [materialLineGapSize](TSL.html#materialLineGapSize).

Default is `null`.

### .isLineDashedNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .offsetNode : Node.<float>

The offset of dash materials is by default inferred from the `dashOffset` property. This node property allows to overwrite the default and define the offset with a node instead.

If you don't want to overwrite the offset but modify the existing value instead, use [materialLineDashOffset](TSL.html#materialLineDashOffset).

Default is `null`.

## Methods

### .setupVariants( builder : NodeBuilder )

Setups the dash specific node variables.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupVariants](NodeMaterial.html#setupVariants)

## Source

[src/materials/nodes/LineDashedNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/LineDashedNodeMaterial.js)