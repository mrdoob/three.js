*Inheritance: EventDispatcher → Node → InputNode → UniformNode → TextureNode →*

# ReflectorNode

This node can be used to implement mirror-like flat reflective surfaces.

## Code Example

```js
const groundReflector = reflector();
material.colorNode = groundReflector;
const plane = new Mesh( geometry, material );
plane.add( groundReflector.target );
```

## Constructor

### new ReflectorNode( parameters : Object )

Constructs a new reflector node.

**parameters**

An object holding configuration parameters.

Default is `{}`.

**target**

The 3D object the reflector is linked to.

Default is `new Object3D()`.

**resolutionScale**

The resolution scale.

Default is `1`.

**generateMipmaps**

Whether mipmaps should be generated or not.

Default is `false`.

**bounces**

Whether reflectors can render other reflector nodes or not.

Default is `true`.

**depth**

Whether depth data should be generated or not.

Default is `false`.

**samples**

Anti-Aliasing samples of the internal render-target.

**defaultTexture**

The default texture node.

**reflector**

The reflector base node.

## Properties

### .reflector : ReflectorBaseNode

A reference to the internal reflector node.

### .target : Object3D

A reference to 3D object the reflector is linked to.

## Methods

### .dispose()

Frees internal resources. Should be called when the node is no longer in use.

**Overrides:** [TextureNode#dispose](TextureNode.html#dispose)

### .getDepthNode() : Node

Returns a node representing the mirror's depth. That can be used to implement more advanced reflection effects like distance attenuation.

**Returns:** The depth node.

## Source

[src/nodes/utils/ReflectorNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/ReflectorNode.js)