*Inheritance: EventDispatcher → Node → InputNode →*

# UniformNode

Class for representing a uniform.

## Constructor

### new UniformNode( value : any, nodeType : string )

Constructs a new uniform node.

**value**

The value of this node. Usually a JS primitive or three.js object (vector, matrix, color, texture).

**nodeType**

The node type. If no explicit type is defined, the node tries to derive the type from its value.

Default is `null`.

## Properties

### .groupNode : UniformGroupNode

The uniform group of this uniform. By default, uniforms are managed per object but they might belong to a shared group which is updated per frame or render call.

### .isUniformNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name or label of the uniform.

Default is `''`.

**Overrides:** [InputNode#name](InputNode.html#name)

## Methods

### .getGroup() : UniformGroupNode

Returns the [UniformNode#groupNode](UniformNode.html#groupNode).

**Returns:** The uniform group.

### .getUniformHash( builder : NodeBuilder ) : string

By default, this method returns the result of [Node#getHash](Node.html#getHash) but derived classes might overwrite this method with a different implementation.

**builder**

The current node builder.

**Returns:** The uniform hash.

### .label( name : string ) : UniformNode

Sets the [UniformNode#name](UniformNode.html#name) property.

**name**

The name of the uniform.

**Deprecated:** Yes

**Returns:** A reference to this node.

### .setGroup( group : UniformGroupNode ) : UniformNode

Sets the [UniformNode#groupNode](UniformNode.html#groupNode) property.

**group**

The uniform group.

**Returns:** A reference to this node.

### .setName( name : string ) : UniformNode

Sets the [UniformNode#name](UniformNode.html#name) property.

**name**

The name of the uniform.

**Returns:** A reference to this node.

## Source

[src/nodes/core/UniformNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/UniformNode.js)