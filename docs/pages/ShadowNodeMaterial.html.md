*Inheritance: EventDispatcher → Material → NodeMaterial →*

# ShadowNodeMaterial

Node material version of [ShadowMaterial](ShadowMaterial.html).

## Constructor

### new ShadowNodeMaterial( parameters : Object )

Constructs a new shadow node material.

**parameters**

The configuration parameter.

## Properties

### .isShadowNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lights : boolean

Set to `true` because so it's possible to implement the shadow mask effect.

Default is `true`.

**Overrides:** [NodeMaterial#lights](NodeMaterial.html#lights)

### .transparent : boolean

Overwritten since shadow materials are transparent by default.

Default is `true`.

**Overrides:** [NodeMaterial#transparent](NodeMaterial.html#transparent)

## Methods

### .setupLightingModel() : ShadowMaskModel

Setups the lighting model.

**Overrides:** [NodeMaterial#setupLightingModel](NodeMaterial.html#setupLightingModel)

**Returns:** The lighting model.

## Source

[src/materials/nodes/ShadowNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/ShadowNodeMaterial.js)