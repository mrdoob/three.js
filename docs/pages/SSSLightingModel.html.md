*Inheritance: LightingModel → PhysicalLightingModel →*

# SSSLightingModel

Represents the lighting model for [MeshSSSNodeMaterial](MeshSSSNodeMaterial.html).

## Constructor

### new SSSLightingModel( clearcoat : boolean, sheen : boolean, iridescence : boolean, anisotropy : boolean, transmission : boolean, dispersion : boolean, sss : boolean )

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

**sss**

Whether SSS is supported or not.

Default is `false`.

## Properties

### .useSSS : boolean

Whether the lighting model should use SSS or not.

Default is `false`.

## Methods

### .direct( input : Object, builder : NodeBuilder )

Extends the default implementation with a SSS term.

Reference: [Approximating Translucency for a Fast, Cheap and Convincing Subsurface Scattering Look](https://colinbarrebrisebois.com/2011/03/07/gdc-2011-approximating-translucency-for-a-fast-cheap-and-convincing-subsurface-scattering-look/)

**input**

The input data.

**builder**

The current node builder.

**Overrides:** [PhysicalLightingModel#direct](PhysicalLightingModel.html#direct)

## Source

[src/materials/nodes/MeshSSSNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshSSSNodeMaterial.js)