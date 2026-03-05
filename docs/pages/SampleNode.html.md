*Inheritance: EventDispatcher → Node →*

# SampleNode

Class representing a node that samples a value using a provided callback function.

## Constructor

### new SampleNode( callback : function, uvNode : Node.<vec2> )

Creates an instance of SampleNode.

**callback**

The function to be called when sampling. Should accept a UV node and return a value.

**uvNode**

The UV node to be used in the texture sampling.

Default is `null`.

## Properties

### .isSampleNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .uvNode : Node.<(vec2|vec3)>

Represents the texture coordinates.

Default is `null`.

### .type : string (readonly)

Returns the type of the node.

## Methods

### .sample( uv : Node.<vec2> ) : Node

Calls the callback function with the provided UV node.

**uv**

The UV node or value to be passed to the callback.

**Returns:** The result of the callback function.

### .setup() : Node

Sets up the node by sampling with the default UV accessor.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The result of the callback function when called with the UV node.

## Source

[src/nodes/utils/SampleNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/utils/SampleNode.js)