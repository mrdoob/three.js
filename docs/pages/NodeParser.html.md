# NodeParser

Base class for node parsers. A derived parser must be implemented for each supported native shader language.

## Constructor

### new NodeParser()

## Methods

### .parseFunction( source : string ) : NodeFunction (abstract)

The method parses the given native code an returns a node function.

**source**

The native shader code.

**Returns:** A node function.

## Source

[src/nodes/core/NodeParser.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/NodeParser.js)