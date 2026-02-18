*Inheritance: LightingModel →*

# PhysicalLightingModel

Represents the lighting model for a PBR material.

## Constructor

### new PhysicalLightingModel( clearcoat : boolean, sheen : boolean, iridescence : boolean, anisotropy : boolean, transmission : boolean, dispersion : boolean )

Constructs a new physical lighting model.

**clearcoat**

Whether clearcoat is supported or not.

Default is `false`.

**sheen**

Whether sheen is supported or not.

Default is `false`.

**iridescence**

Whether iridescence is supported or not.

Default is `false`.

**anisotropy**

Whether anisotropy is supported or not.

Default is `false`.

**transmission**

Whether transmission is supported or not.

Default is `false`.

**dispersion**

Whether dispersion is supported or not.

Default is `false`.

## Properties

### .anisotropy : boolean

Whether anisotropy is supported or not.

Default is `false`.

### .clearcoat : boolean

Whether clearcoat is supported or not.

Default is `false`.

### .clearcoatRadiance : Node

The clear coat radiance.

Default is `null`.

### .clearcoatSpecularDirect : Node

The clear coat specular direct.

Default is `null`.

### .clearcoatSpecularIndirect : Node

The clear coat specular indirect.

Default is `null`.

### .dispersion : boolean

Whether dispersion is supported or not.

Default is `false`.

### .iridescence : boolean

Whether iridescence is supported or not.

Default is `false`.

### .iridescenceF0 : Node

The iridescence F0.

Default is `null`.

### .iridescenceF0Dielectric : Node

The iridescence F0 dielectric.

Default is `null`.

### .iridescenceF0Metallic : Node

The iridescence F0 metallic.

Default is `null`.

### .iridescenceFresnel : Node

The iridescence Fresnel.

Default is `null`.

### .sheen : boolean

Whether sheen is supported or not.

Default is `false`.

### .sheenSpecularDirect : Node

The sheen specular direct.

Default is `null`.

### .sheenSpecularIndirect : Node

The sheen specular indirect.

Default is `null`.

### .transmission : boolean

Whether transmission is supported or not.

Default is `false`.

## Methods

### .ambientOcclusion( builder : NodeBuilder )

Implements the ambient occlusion term.

**builder**

The current node builder.

**Overrides:** [LightingModel#ambientOcclusion](LightingModel.html#ambientOcclusion)

### .direct( lightData : Object, builder : NodeBuilder )

Implements the direct light.

**lightData**

The light data.

**builder**

The current node builder.

**Overrides:** [LightingModel#direct](LightingModel.html#direct)

### .directRectArea( input : Object, builder : NodeBuilder )

This method is intended for implementing the direct light term for rect area light nodes.

**input**

The input data.

**builder**

The current node builder.

**Overrides:** [LightingModel#directRectArea](LightingModel.html#directRectArea)

### .finish( builder : NodeBuilder )

Used for final lighting accumulations depending on the requested features.

**builder**

The current node builder.

**Overrides:** [LightingModel#finish](LightingModel.html#finish)

### .indirect( builder : NodeBuilder )

Implements the indirect lighting.

**builder**

The current node builder.

**Overrides:** [LightingModel#indirect](LightingModel.html#indirect)

### .indirectDiffuse( builder : NodeBuilder )

Implements the indirect diffuse term.

**builder**

The current node builder.

### .indirectSpecular( builder : NodeBuilder )

Implements the indirect specular term.

**builder**

The current node builder.

### .start( builder : NodeBuilder )

Depending on what features are requested, the method prepares certain node variables which are later used for lighting computations.

**builder**

The current node builder.

**Overrides:** [LightingModel#start](LightingModel.html#start)

## Source

[src/nodes/functions/PhysicalLightingModel.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/functions/PhysicalLightingModel.js)