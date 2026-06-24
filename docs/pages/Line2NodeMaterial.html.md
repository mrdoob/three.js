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

**Deprecated:** since r185. Use [NodeMaterial#colorNode](NodeMaterial.html#colorNode) instead.

### .offsetNode : Node.<float>

Defines the offset.

Default is `null`.

### .vertexColors : boolean

Whether vertex colors should be used or not.

Default is `false`.

**Overrides:** [NodeMaterial#vertexColors](NodeMaterial.html#vertexColors)

### .worldUnits : boolean

Whether the lines should sized in world units or not. When set to `false` the unit is pixel.

Default is `false`.

## Methods

### .setupDiffuseColor( builder : NodeBuilder )

Setups the diffuse color of the line material in the fragment stage. Overrides the base setup to incorporate line/dash rendering and blending.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupDiffuseColor](NodeMaterial.html#setupDiffuseColor)

### .setupModelViewProjection( builder : NodeBuilder ) : Node.<vec4>

Setups the position in clip space for the vertex stage of the fat line. Overrides the default model-view-projection to return the expanded fat line vertex coordinates.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupModelViewProjection](NodeMaterial.html#setupModelViewProjection)

**Returns:** The position of the fat line vertex in clip space.

## Source

[src/materials/nodes/Line2NodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/Line2NodeMaterial.js)