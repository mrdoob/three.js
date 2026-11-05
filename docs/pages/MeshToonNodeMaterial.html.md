*Inheritance: EventDispatcher → Material → NodeMaterial →*

# MeshToonNodeMaterial

Node material version of [MeshToonMaterial](MeshToonMaterial.html).

## Constructor

### new MeshToonNodeMaterial( parameters : Object )

Constructs a new mesh toon node material.

**parameters**

The configuration parameter.

## Properties

### .emissiveNode : Node.<vec3>

The emissive color of toon materials is by default inferred from the `emissive`, `emissiveIntensity` and `emissiveMap` properties. This node property allows to overwrite the default and define the emissive color with a node instead.

If you don't want to overwrite the emissive color but modify the existing value instead, use [materialEmissive](TSL.html#materialEmissive).

Default is `null`.

### .isMeshToonNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lights : boolean

Set to `true` because toon materials react on lights.

Default is `true`.

**Overrides:** [NodeMaterial#lights](NodeMaterial.html#lights)

## Methods

### .setupLightingModel() : ToonLightingModel

Setups the lighting model.

**Overrides:** [NodeMaterial#setupLightingModel](NodeMaterial.html#setupLightingModel)

**Returns:** The lighting model.

## Source

[src/materials/nodes/MeshToonNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshToonNodeMaterial.js)