*Inheritance: EventDispatcher → Node →*

# UniformGroupNode

This node can be used to group single instances of [UniformNode](UniformNode.html) and manage them as a uniform buffer.

In most cases, the predefined nodes `objectGroup`, `renderGroup` and `frameGroup` will be used when defining the [UniformNode#groupNode](UniformNode.html#groupNode) property.

*   `objectGroup`: Uniform buffer per object.
*   `renderGroup`: Shared uniform buffer, updated once per render call.
*   `frameGroup`: Shared uniform buffer, updated once per frame.

## Constructor

### new UniformGroupNode( name : string, shared : boolean, order : number )

Constructs a new uniform group node.

**name**

The name of the uniform group node.

**shared**

Whether this uniform group node is shared or not.

Default is `false`.

**order**

Influences the internal sorting.

Default is `1`.

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

## Source

[src/nodes/core/UniformGroupNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/UniformGroupNode.js)