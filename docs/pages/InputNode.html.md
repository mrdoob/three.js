*Inheritance: EventDispatcher → Node →*

# InputNode

Base class for representing data input nodes.

## Constructor

### new InputNode( value : any, nodeType : string )

Constructs a new input node.

**value**

The value of this node. This can be any JS primitive, functions, array buffers or even three.js objects (vector, matrices, colors).

**nodeType**

The node type. If no explicit type is defined, the node tries to derive the type from its value.

Default is `null`.

## Properties

### .isInputNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .precision : 'low' | 'medium' | 'high'

The precision of the value in the shader.

Default is `null`.

### .value : any

The value of this node. This can be any JS primitive, functions, array buffers or even three.js objects (vector, matrices, colors).

## Methods

### .getInputType( builder : NodeBuilder ) : string

Returns the input type of the node which is by default the node type. Derived modules might overwrite this method and use a fixed type or compute one analytically.

A typical example for different input and node types are textures. The input type of a normal RGBA texture is `texture` whereas its node type is `vec4`.

**builder**

The current node builder.

**Returns:** The input type.

### .setPrecision( precision : 'low' | 'medium' | 'high' ) : InputNode

Sets the precision to the given value. The method can be overwritten in derived classes if the final precision must be computed analytically.

**precision**

The precision of the input value in the shader.

**Returns:** A reference to this node.

## Source

[src/nodes/core/InputNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/InputNode.js)