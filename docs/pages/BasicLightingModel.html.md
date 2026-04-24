*Inheritance: LightingModel →*

# BasicLightingModel

Represents the lighting model for unlit materials. The only light contribution is baked indirect lighting modulated with ambient occlusion and the material's diffuse color. Environment mapping is supported. Used in [MeshBasicNodeMaterial](MeshBasicNodeMaterial.html).

## Constructor

### new BasicLightingModel()

Constructs a new basic lighting model.

## Methods

### .finish( builder : NodeBuilder )

Implements the environment mapping.

**builder**

The current node builder.

**Overrides:** [LightingModel#finish](LightingModel.html#finish)

### .indirect( builder : NodeBuilder )

Implements the baked indirect lighting with its modulation.

**builder**

The current node builder.

**Overrides:** [LightingModel#indirect](LightingModel.html#indirect)

## Source

[src/nodes/functions/BasicLightingModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/functions/BasicLightingModel.js)