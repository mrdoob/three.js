*Inheritance: EventDispatcher → Node → InputNode → UniformNode → BufferNode →*

# StorageBufferNode

This node is used in context of compute shaders and allows to define a storage buffer for data. A typical workflow is to create instances of this node with the convenience functions `attributeArray()` or `instancedArray()`, setup up a compute shader that writes into the buffers and then convert the storage buffers to attribute nodes for rendering.

## Code Example

```js
const positionBuffer = instancedArray( particleCount, 'vec3' ); // the storage buffer node
const computeInit = Fn( () => { // the compute shader
	const position = positionBuffer.element( instanceIndex );
	// compute position data
	position.x = 1;
	position.y = 1;
	position.z = 1;
} )().compute( particleCount );
const particleMaterial = new THREE.SpriteNodeMaterial();
particleMaterial.positionNode = positionBuffer.toAttribute();
renderer.computeAsync( computeInit );
```

## Constructor

### new StorageBufferNode( value : StorageBufferAttribute | StorageInstancedBufferAttribute | BufferAttribute, bufferType : string | Struct, bufferCount : number )

Constructs a new storage buffer node.

**value**

The buffer data.

**bufferType**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**bufferCount**

The buffer count.

Default is `0`.

## Properties

### .access : string

The access type of the texture node.

Default is `'readWrite'`.

### .global : boolean

`StorageBufferNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [BufferNode#global](BufferNode.html#global)

### .isAtomic : boolean

Whether the node is atomic or not.

Default is `false`.

### .isPBO : boolean

Whether the node represents a PBO or not. Only relevant for WebGL.

Default is `false`.

### .isStorageBufferNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .structTypeNode : StructTypeNode

The buffer struct type.

Default is `null`.

## Methods

### .element( indexNode : IndexNode ) : StorageArrayElementNode

Enables element access with the given index node.

**indexNode**

The index node.

**Returns:** A node representing the element access.

### .generate( builder : NodeBuilder ) : string

Generates the code snippet of the storage buffer node.

**builder**

The current node builder.

**Overrides:** [BufferNode#generate](BufferNode.html#generate)

**Returns:** The generated code snippet.

### .getAttributeData() : Object

Returns attribute data for this storage buffer node.

**Returns:** The attribute data.

### .getHash( builder : NodeBuilder ) : string

This method is overwritten since the buffer data might be shared and thus the hash should be shared as well.

**builder**

The current node builder.

**Overrides:** [BufferNode#getHash](BufferNode.html#getHash)

**Returns:** The hash.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'indirectStorageBuffer'` or `'storageBuffer'`.

**builder**

The current node builder.

**Overrides:** [BufferNode#getInputType](BufferNode.html#getInputType)

**Returns:** The input type.

### .getMemberType( builder : NodeBuilder, name : string ) : string

Returns the type of a member of the struct.

**builder**

The current node builder.

**name**

The name of the member.

**Overrides:** [BufferNode#getMemberType](BufferNode.html#getMemberType)

**Returns:** The type of the member.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type from the availability of storage buffers and the attribute data.

**builder**

The current node builder.

**Overrides:** [BufferNode#getNodeType](BufferNode.html#getNodeType)

**Returns:** The node type.

### .getPBO() : boolean

Returns the `isPBO` value.

**Returns:** Whether the node represents a PBO or not.

### .setAccess( value : string ) : StorageBufferNode

Defines the node access.

**value**

The node access.

**Returns:** A reference to this node.

### .setAtomic( value : boolean ) : StorageBufferNode

Defines whether the node is atomic or not.

**value**

The atomic flag.

**Returns:** A reference to this node.

### .setPBO( value : boolean ) : StorageBufferNode

Defines whether this node is a PBO or not. Only relevant for WebGL.

**value**

The value so set.

**Returns:** A reference to this node.

### .toAtomic() : StorageBufferNode

Convenience method for making this node atomic.

**Returns:** A reference to this node.

### .toReadOnly() : StorageBufferNode

Convenience method for configuring a read-only node access.

**Returns:** A reference to this node.

## Source

[src/nodes/accessors/StorageBufferNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/StorageBufferNode.js)