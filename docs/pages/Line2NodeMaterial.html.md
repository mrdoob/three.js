*Inheritance: EventDispatcher → Material → NodeMaterial →*

# Line2NodeMaterial

This node material can be used to render lines with a size larger than one by representing them as instanced meshes.

## Constructor

### new Line2NodeMaterial( parameters : Object )

Constructs a new node material for wide line rendering.

**parameters**

The configuration parameter.

Default is `{}`.

## Properties

### .alphaToCoverage : boolean

Whether alpha to coverage should be used or not.

Default is `true`.

**Overrides:** [NodeMaterial#alphaToCoverage](NodeMaterial.html#alphaToCoverage)

### .blending : number

Blending is set to `NoBlending` since transparency is not supported, yet.

Default is `0`.

**Overrides:** [NodeMaterial#blending](NodeMaterial.html#blending)

### .dashOffset : number

The dash offset.

Default is `0`.

### .dashScaleNode : Node.<float>

Defines the dash scale.

Default is `null`.

### .dashSizeNode : Node.<float>

Defines the dash size.

Default is `null`.

### .dashed : boolean

Whether the lines should be dashed or not.

Default is `false`.

### .gapSizeNode : Node.<float>

Defines the gap size.

Default is `null`.

### .isLine2NodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lineColorNode : Node.<vec3>

Defines the lines color.

Default is `null`.

### .offsetNode : Node.<float>

Defines the offset.

Default is `null`.

### .useColor : boolean

Whether vertex colors should be used or not.

Default is `false`.

### .worldUnits : boolean

Whether the lines should sized in world units or not. When set to `false` the unit is pixel.

Default is `false`.

## Methods

### .setup( builder : NodeBuilder )

Setups the vertex and fragment stage of this node material.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setup](NodeMaterial.html#setup)

## Source

[src/materials/nodes/Line2NodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/Line2NodeMaterial.js)