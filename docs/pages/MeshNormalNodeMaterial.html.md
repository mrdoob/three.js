*Inheritance: EventDispatcher → Material → NodeMaterial →*

# MeshNormalNodeMaterial

Node material version of [MeshNormalMaterial](MeshNormalMaterial.html).

## Constructor

### new MeshNormalNodeMaterial( parameters : Object )

Constructs a new mesh normal node material.

**parameters**

The configuration parameter.

## Properties

### .isMeshNormalNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .setupDiffuseColor()

Overwrites the default implementation by computing the diffuse color based on the normal data.

**Overrides:** [NodeMaterial#setupDiffuseColor](NodeMaterial.html#setupDiffuseColor)

## Source

[src/materials/nodes/MeshNormalNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshNormalNodeMaterial.js)