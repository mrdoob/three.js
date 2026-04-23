*Inheritance: LightingModel →*

# ToonLightingModel

Represents the lighting model for a toon material. Used in [MeshToonNodeMaterial](MeshToonNodeMaterial.html).

## Constructor

### new ToonLightingModel()

## Methods

### .direct( lightData : Object, builder : NodeBuilder )

Implements the direct lighting. Instead of using a conventional smooth irradiance, the irradiance is reduced to a small number of discrete shades to create a comic-like, flat look.

**lightData**

The light data.

**builder**

The current node builder.

**Overrides:** [LightingModel#direct](LightingModel.html#direct)

### .indirect( builder : NodeBuilder )

Implements the indirect lighting.

**builder**

The current node builder.

**Overrides:** [LightingModel#indirect](LightingModel.html#indirect)

## Source

[src/nodes/functions/ToonLightingModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/functions/ToonLightingModel.js)