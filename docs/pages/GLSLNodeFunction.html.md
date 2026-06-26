*Inheritance: NodeFunction →*

# GLSLNodeFunction

This class represents a GLSL node function.

## Constructor

### new GLSLNodeFunction( source : string )

Constructs a new GLSL node function.

**source**

The GLSL source.

## Methods

### .getCode( name : string ) : string

This method returns the GLSL code of the node function.

**name**

The function's name.

Default is `this.name`.

**Overrides:** [NodeFunction#getCode](NodeFunction.html#getCode)

**Returns:** The shader code.

## Source

[src/nodes/parsers/GLSLNodeFunction.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/parsers/GLSLNodeFunction.js)