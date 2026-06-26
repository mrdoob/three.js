*Inheritance: EventDispatcher → Node →*

# UniformGroupNode

This node can be used to group single instances of [UniformNode](UniformNode.html) and manage them as a uniform buffer.

In most cases, the predefined nodes `objectGroup`, `renderGroup` and `frameGroup` will be used when defining the [UniformNode#groupNode](UniformNode.html#groupNode) property.

*   `objectGroup`: Uniform buffer per object.
*   `renderGroup`: Shared uniform buffer, updated once per render call.
*   `frameGroup`: Shared uniform buffer, updated once per frame.

## Constructor

### new UniformGroupNode( name : string, shared : boolean, order : number, updateType : string | null )

Constructs a new uniform group node.

**name**

The name of the uniform group node.

**shared**

Whether this uniform group node is shared or not.

Default is `false`.

**order**

Influences the internal sorting.

Default is `1`.

**updateType**

The update type of the uniform group node.

Default is `null`.

## Properties

### .isUniformGroup : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .name : string

The name of the uniform group node.

**Overrides:** [Node#name](Node.html#name)

### .order : number

Influences the internal sorting. TODO: Add details when this property should be changed.

Default is `1`.

### .shared : boolean

Whether this uniform group node is shared or not.

Default is `false`.

### .updateType : string | null

The update type of the uniform group node.

Default is `null`.

**Overrides:** [Node#updateType](Node.html#updateType)

## Methods

### .deserialize( data : Object )

Deserializes the uniform group node from a JSON object.

**data**

The object containing the serialized data.

**Overrides:** [Node#deserialize](Node.html#deserialize)

### .serialize( data : Object )

Serializes the uniform group node to a JSON object.

**data**

The object to store the serialized data.

**Overrides:** [Node#serialize](Node.html#serialize)

### .update()

Marks the uniform group node as needing an update. This will trigger the necessary updates in the rendering process.

**Overrides:** [Node#update](Node.html#update)

## Source

[src/nodes/core/UniformGroupNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/UniformGroupNode.js)