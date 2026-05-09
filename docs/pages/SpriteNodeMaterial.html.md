*Inheritance: EventDispatcher → Material → NodeMaterial →*

# SpriteNodeMaterial

Node material version of [SpriteMaterial](SpriteMaterial.html).

## Constructor

### new SpriteNodeMaterial( parameters : Object )

Constructs a new sprite node material.

**parameters**

The configuration parameter.

## Properties

### .isSpriteNodeMaterial : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .positionNode : Node.<vec2>

This property makes it possible to define the position of the sprite with a node. That can be useful when the material is used with instanced rendering and node data are defined with an instanced attribute node:

```js
const positionAttribute = new InstancedBufferAttribute( new Float32Array( positions ), 3 );
material.positionNode = instancedBufferAttribute( positionAttribute );
```

Another possibility is to compute the instanced data with a compute shader:

```js
const positionBuffer = instancedArray( particleCount, 'vec3' );
particleMaterial.positionNode = positionBuffer.toAttribute();
```

Default is `null`.

**Overrides:** [NodeMaterial#positionNode](NodeMaterial.html#positionNode)

### .rotationNode : Node.<float>

The rotation of sprite materials is by default inferred from the `rotation`, property. This node property allows to overwrite the default and define the rotation with a node instead.

If you don't want to overwrite the rotation but modify the existing value instead, use [materialRotation](TSL.html#materialRotation).

Default is `null`.

### .scaleNode : Node.<vec2>

This node property provides an additional way to scale sprites next to `Object3D.scale`. The scale transformation based in `Object3D.scale` is multiplied with the scale value of this node in the vertex shader.

Default is `null`.

### .sizeAttenuation : boolean

Whether to use size attenuation or not.

Default is `true`.

### .transparent : boolean

In Sprites, the transparent property is enabled by default.

Default is `true`.

**Overrides:** [NodeMaterial#transparent](NodeMaterial.html#transparent)

## Methods

### .setupPositionView( builder : NodeBuilder ) : Node.<vec3>

Setups the position node in view space. This method implements the sprite specific vertex shader.

**builder**

The current node builder.

**Overrides:** [NodeMaterial#setupPositionView](NodeMaterial.html#setupPositionView)

**Returns:** The position in view space.

## Source

[src/materials/nodes/SpriteNodeMaterial.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/SpriteNodeMaterial.js)