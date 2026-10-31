*Inheritance: EventDispatcher → Node →*

# ReferenceAttributeNode

This node binds a buffer attribute that is a property of the rendered object, like the matrices of an instanced mesh. Unlike [BufferAttributeNode](BufferAttributeNode.html), the attribute isn't part of the program: each object binds its own attribute, so objects can share a program.

Matrices are bound as columns. Storage buffer attributes are bound as storage buffers.

## Code Example

```js
const matrix = referenceAttribute( 'instanceMatrix', 'mat4' );
const color = referenceAttribute( 'instanceColor' );
```

## Constructor

### new ReferenceAttributeNode( property : string, nodeType : string, object : Object )

Constructs a new reference attribute node.

**property**

The name of the property the node refers to.

**nodeType**

The node type. Inferred from the attribute if not set.

Default is `null`.

**object**

The object the property belongs to. The rendered object if not set.

Default is `null`.

## Properties

### .object : Object

The object the property belongs to. If `null`, the rendered object is used.

Default is `null`.

### .properties : Array.<string>

The property name might have dots so nested properties can be referred. The hierarchy of the names is stored inside this array.

### .property : string

The name of the property the node refers to.

## Methods

### .generateNodeType( builder : NodeBuilder ) : string

Returns the node type, inferred from the attribute if not set.

**builder**

The current node builder.

**Overrides:** [Node#generateNodeType](Node.html#generateNodeType)

**Returns:** The node type.

### .getAttribute( object : Object3D ) : BufferAttribute | InterleavedBufferAttribute

Returns the attribute the node binds when rendering the given object.

**object**

The rendered object.

**Returns:** The buffer attribute.

### .getValueFromReference( object : Object ) : BufferAttribute | InterleavedBufferAttribute

Returns the value of the referred property of the given object.

**object**

The object.

**Returns:** The value of the referred property.

### .setup( builder : NodeBuilder ) : Node

Sets up the attribute nodes.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The attribute node.

## Source

[src/nodes/accessors/ReferenceAttributeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ReferenceAttributeNode.js)