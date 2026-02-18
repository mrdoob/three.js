*Inheritance: NodeFunction →*

# WGSLNodeFunction

This class represents a WSL node function.

## Constructor

### new WGSLNodeFunction( source : string )

Constructs a new WGSL node function.

**source**

The WGSL source.

## Methods

### .getCode( name : string ) : string

This method returns the WGSL code of the node function.

**name**

The function's name.

Default is `this.name`.

**Overrides:** [NodeFunction#getCode](NodeFunction.html#getCode)

**Returns:** The shader code.

## Source

[src/renderers/webgpu/nodes/WGSLNodeFunction.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webgpu/nodes/WGSLNodeFunction.js)