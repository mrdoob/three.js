# NodeFunctionInput

Describes the input of a [NodeFunction](NodeFunction.html).

## Constructor

### new NodeFunctionInput( type : string, name : string, count : number, qualifier : 'in' | 'out' | 'inout', isConst : boolean )

Constructs a new node function input.

**type**

The input type.

**name**

The input name.

**count**

If the input is an Array, count will be the length.

Default is `null`.

**qualifier**

The parameter qualifier (only relevant for GLSL).

Default is `''`.

**isConst**

Whether the input uses a const qualifier or not (only relevant for GLSL).

Default is `false`.

## Properties

### .count : number

If the input is an Array, count will be the length.

Default is `null`.

### .isConst : boolean

Whether the input uses a const qualifier or not (only relevant for GLSL).

Default is `false`.

### .name : string

The input name.

### .qualifier : 'in' | 'out' | 'inout'

The parameter qualifier (only relevant for GLSL).

Default is `''`.

### .type : string

The input type.

## Source

[src/nodes/core/NodeFunctionInput.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/NodeFunctionInput.js)