# NodeFunction

Base class for node functions. A derived module must be implemented for each supported native shader language. Similar to other `Node*` modules, this class is only relevant during the building process and not used in user-level code.

## Constructor

### new NodeFunction( type : string, inputs : Array.<NodeFunctionInput>, name : string, precision : string )

Constructs a new node function.

**type**

The node type. This type is the return type of the node function.

**inputs**

The function's inputs.

**name**

The function's name.

Default is `''`.

**precision**

The precision qualifier.

Default is `''`.

## Properties

### .inputs : Array.<NodeFunctionInput>

The function's inputs.

### .name : string

The name of the uniform.

Default is `''`.

### .precision : string

The precision qualifier.

Default is `''`.

### .type : string

The node type. This type is the return type of the node function.

## Methods

### .getCode( name : string ) : string (abstract)

This method returns the native code of the node function.

**name**

The function's name.

**Returns:** A shader code.

## Source

[src/nodes/core/NodeFunction.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/NodeFunction.js)