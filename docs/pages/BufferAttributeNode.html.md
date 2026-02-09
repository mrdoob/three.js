*Inheritance: EventDispatcher → Node → InputNode →*

# BufferAttributeNode

In earlier `three.js` versions it was only possible to define attribute data on geometry level. With `BufferAttributeNode`, it is also possible to do this on the node level.

This new approach is especially interesting when geometry data are generated via compute shaders. The below line converts a storage buffer into an attribute node.

```js
material.positionNode = positionBuffer.toAttribute();
```

## Code Example

```js
const geometry = new THREE.PlaneGeometry();
const positionAttribute = geometry.getAttribute( 'position' );
const colors = [];
for ( let i = 0; i < position.count; i ++ ) {
	colors.push( 1, 0, 0 );
}
material.colorNode = bufferAttribute( new THREE.Float32BufferAttribute( colors, 3 ) );
```

## Constructor

### new BufferAttributeNode( value : BufferAttribute | InterleavedBuffer | TypedArray, bufferType : string, bufferStride : number, bufferOffset : number )

Constructs a new buffer attribute node.

**value**

The attribute data.

**bufferType**

The buffer type (e.g. `'vec3'`).

Default is `null`.

**bufferStride**

The buffer stride.

Default is `0`.

**bufferOffset**

The buffer offset.

Default is `0`.

## Properties

### .attribute : BufferAttribute

A reference to the buffer attribute.

Default is `null`.

### .bufferOffset : number

The buffer offset.

Default is `0`.

### .bufferStride : number

The buffer stride.

Default is `0`.

### .bufferType : string

The buffer type (e.g. `'vec3'`).

Default is `null`.

### .global : boolean

`BufferAttributeNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [InputNode#global](InputNode.html#global)

### .instanced : boolean

Whether the attribute is instanced or not.

Default is `false`.

### .isBufferNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .usage : number

The usage property. Set this to `THREE.DynamicDrawUsage` via `.setUsage()`, if you are planning to update the attribute data per frame.

Default is `StaticDrawUsage`.

## Methods

### .generate( builder : NodeBuilder ) : string

Generates the code snippet of the buffer attribute node.

**builder**

The current node builder.

**Overrides:** [InputNode#generate](InputNode.html#generate)

**Returns:** The generated code snippet.

### .getHash( builder : NodeBuilder ) : string

This method is overwritten since the attribute data might be shared and thus the hash should be shared as well.

**builder**

The current node builder.

**Overrides:** [InputNode#getHash](InputNode.html#getHash)

**Returns:** The hash.

### .getInputType( builder : NodeBuilder ) : string

Overwrites the default implementation to return a fixed value `'bufferAttribute'`.

**builder**

The current node builder.

**Overrides:** [InputNode#getInputType](InputNode.html#getInputType)

**Returns:** The input type.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from the buffer attribute.

**builder**

The current node builder.

**Overrides:** [InputNode#getNodeType](InputNode.html#getNodeType)

**Returns:** The node type.

### .setInstanced( value : boolean ) : BufferAttributeNode

Sets the `instanced` property to the given value.

**value**

The value to set.

**Returns:** A reference to this node.

### .setUsage( value : number ) : BufferAttributeNode

Sets the `usage` property to the given value.

**value**

The usage to set.

**Returns:** A reference to this node.

### .setup( builder : NodeBuilder )

Depending on which value was passed to the node, `setup()` behaves differently. If no instance of `BufferAttribute` was passed, the method creates an internal attribute and configures it respectively.

**builder**

The current node builder.

**Overrides:** [InputNode#setup](InputNode.html#setup)

## Source

[src/nodes/accessors/BufferAttributeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/BufferAttributeNode.js)