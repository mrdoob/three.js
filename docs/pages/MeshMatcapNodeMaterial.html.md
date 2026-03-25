*Inheritance: EventDispatcher → Material → NodeMaterial →*

# MeshMatcapNodeMaterial

Node material version of [MeshMatcapMaterial](MeshMatcapMaterial.html).

## Constructor

### new MeshMatcapNodeMaterial( parameters : Object )

Constructs a new mesh normal node material.

**parameters**

The configuration parameter.

## Properties

### .isMeshMatcapNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .setupVariants( builder : NodeBuilder )

Setups the matcap specific node variables.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupVariants](NodeMaterial.html#setupVariants)

## Source

[src/materials/nodes/MeshMatcapNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshMatcapNodeMaterial.js)