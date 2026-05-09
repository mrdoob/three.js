*Inheritance: NodeParser →*

# WGSLNodeParser

A WGSL node parser.

## Constructor

### new WGSLNodeParser()

## Methods

### .parseFunction( source : string ) : WGSLNodeFunction

The method parses the given WGSL code an returns a node function.

**source**

The WGSL code.

**Overrides:** [NodeParser#parseFunction](NodeParser.html#parseFunction)

**Returns:** A node function.

## Source

[src/renderers/webgpu/nodes/WGSLNodeParser.js](https://github.com/mrdoob/three.js/blob/master/src/renderers/webgpu/nodes/WGSLNodeParser.js)