*Inheritance: EventDispatcher → Material →*

# NodeMaterialInstance

A material instance that reuses the shader of a node material with its own properties. All instances created from the same node material share a single shader build, so configure the node material before creating instances. Instance values are read in the shared node graph with `materialReference( name, type )`. Node properties such as `colorNode` are read-only and always read from the node material.

## Code Example

```js
const nodeMaterial = new MeshBasicNodeMaterial();
nodeMaterial.colorNode = materialReference( 'myColor', 'color' );
const material = new NodeMaterialInstance( nodeMaterial );
material.myColor = new Color( 1, 0, 0 );
```

## Constructor

### new NodeMaterialInstance( nodeMaterial : NodeMaterial )

Constructs a new node material instance.

**nodeMaterial**

The node material defining the shared shader.

## Properties

### .isNodeMaterialInstance : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .nodeMaterial : NodeMaterial

The node material defining the shared shader.

### .version : number

The version of the node material. Setting `needsUpdate` on the node material updates all its instances, while setting it on an instance has no effect.

**Overrides:** [Material#version](Material.html#version)

## Methods

### .build( builder : NodeBuilder )

Builds the shader of the node material while keeping this instance as `builder.material`.

**builder**

The current node builder.

### .clone() : NodeMaterialInstance

Returns a new node material instance that shares the same node material.

**Overrides:** [Material#clone](Material.html#clone)

**Returns:** A clone of this instance.

### .copy( source : NodeMaterialInstance ) : NodeMaterialInstance

Copies the values of the given node material instance to this instance. Object values such as colors are shared with the source, except in `userData`. Unlike [Material#copy](Material.html#copy), `userData` is not copied via JSON: its first level values are cloned when possible, so types such as colors are preserved. Textures remain shared.

**source**

The material to copy.

**Overrides:** [Material#copy](Material.html#copy)

**Returns:** A reference to this instance.

### .customProgramCacheKey() : string

Returns a cache key that identifies the shared shader, without traversing the node graph for each instance.

**Overrides:** [Material#customProgramCacheKey](Material.html#customProgramCacheKey)

**Returns:** The custom program cache key.

## Source

[src/materials/nodes/NodeMaterialInstance.js](https://github.com/mrdoob/three.js/blob/master/src/materials/nodes/NodeMaterialInstance.js)