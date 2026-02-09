*Inheritance: EventDispatcher → Node →*

# ReferenceBaseNode

Base class for nodes which establishes a reference to a property of another object. In this way, the value of the node is automatically linked to the value of referenced object. Reference nodes internally represent the linked value as a uniform.

## Constructor

### new ReferenceBaseNode( property : string, uniformType : string, object : Object, count : number )

Constructs a new reference base node.

**property**

The name of the property the node refers to.

**uniformType**

The uniform type that should be used to represent the property value.

**object**

The object the property belongs to.

Default is `null`.

**count**

When the linked property is an array-like, this parameter defines its length.

Default is `null`.

## Properties

### .count : number

When the linked property is an array, this parameter defines its length.

Default is `null`.

### .group : UniformGroupNode

The uniform group of the internal uniform.

Default is `null`.

### .node : UniformNode

The uniform node that holds the value of the reference node.

Default is `null`.

### .object : Object

The object the property belongs to.

Default is `null`.

### .properties : Array.<string>

The property name might have dots so nested properties can be referred. The hierarchy of the names is stored inside this array.

### .property : string

The name of the property the node refers to.

### .reference : Object

Points to the current referred object. This property exists next to [ReferenceNode#object](ReferenceNode.html#object) since the final reference might be updated from calling code.

Default is `null`.

### .uniformType : string

The uniform type that should be used to represent the property value.

### .updateType : string

Overwritten since reference nodes are updated per object.

Default is `'object'`.

**Overrides:** [Node#updateType](Node.html#updateType)

## Methods

### .element( indexNode : IndexNode ) : ReferenceElementNode

When the referred property is array-like, this method can be used to access elements via an index node.

**indexNode**

indexNode.

**Returns:** A reference to an element.

### .getNodeType( builder : NodeBuilder ) : string

This method is overwritten since the node type is inferred from the type of the reference node.

**builder**

The current node builder.

**Overrides:** [Node#getNodeType](Node.html#getNodeType)

**Returns:** The node type.

### .getValueFromReference( object : Object ) : any

Returns the property value from the given referred object.

**object**

The object to retrieve the property value from.

Default is `this.reference`.

**Returns:** The value.

### .setGroup( group : UniformGroupNode ) : ReferenceBaseNode

Sets the uniform group for this reference node.

**group**

The uniform group to set.

**Returns:** A reference to this node.

### .setNodeType( uniformType : string )

Sets the node type which automatically defines the internal uniform type.

**uniformType**

The type to set.

### .setup() : UniformNode

The output of the reference node is the internal uniform node.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The output node.

### .update( frame : NodeFrame )

Overwritten to update the internal uniform value.

**frame**

A reference to the current node frame.

**Overrides:** [Node#update](Node.html#update)

### .updateReference( state : NodeFrame | NodeBuilder ) : Object

Allows to update the reference based on the given state. The state is only evaluated [ReferenceBaseNode#object](ReferenceBaseNode.html#object) is not set.

**state**

The current state.

**Overrides:** [Node#updateReference](Node.html#updateReference)

**Returns:** The updated reference.

### .updateValue()

Retrieves the value from the referred object property and uses it to updated the internal uniform.

## Source

[src/nodes/accessors/ReferenceBaseNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ReferenceBaseNode.js)