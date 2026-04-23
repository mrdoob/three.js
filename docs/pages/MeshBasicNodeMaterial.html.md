*Inheritance: EventDispatcher → Material → NodeMaterial →*

# MeshBasicNodeMaterial

Node material version of [MeshBasicMaterial](MeshBasicMaterial.html).

## Constructor

### new MeshBasicNodeMaterial( parameters : Object )

Constructs a new mesh basic node material.

**parameters**

The configuration parameter.

## Properties

### .isMeshBasicNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .lights : boolean

Although the basic material is by definition unlit, we set this property to `true` since we use a lighting model to compute the outgoing light of the fragment shader.

Default is `true`.

**Overrides:** [NodeMaterial#lights](NodeMaterial.html#lights)

## Methods

### .setupEnvironment( builder : NodeBuilder ) : BasicEnvironmentNode.<vec3>

Overwritten since this type of material uses [BasicEnvironmentNode](BasicEnvironmentNode.html) to implement the default environment mapping.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupEnvironment](NodeMaterial.html#setupEnvironment)

**Returns:** The environment node.

### .setupLightMap( builder : NodeBuilder ) : BasicLightMapNode.<vec3>

This method must be overwritten since light maps are evaluated with a special scaling factor for basic materials.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupLightMap](NodeMaterial.html#setupLightMap)

**Returns:** The light map node.

### .setupLightingModel() : BasicLightingModel

Setups the lighting model.

**Overrides:** [NodeMaterial#setupLightingModel](NodeMaterial.html#setupLightingModel)

**Returns:** The lighting model.

### .setupNormal() : Node.<vec3>

Basic materials are not affected by normal and bump maps so we return by default [normalViewGeometry](TSL.html#normalViewGeometry).

**Overrides:** [NodeMaterial#setupNormal](NodeMaterial.html#setupNormal)

**Returns:** The normal node.

### .setupOutgoingLight() : Node.<vec3>

The material overwrites this method because `lights` is set to `true` but we still want to return the diffuse color as the outgoing light.

**Overrides:** [NodeMaterial#setupOutgoingLight](NodeMaterial.html#setupOutgoingLight)

**Returns:** The outgoing light node.

## Source

[src/materials/nodes/MeshBasicNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/MeshBasicNodeMaterial.js)