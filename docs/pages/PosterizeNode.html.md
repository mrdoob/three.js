*Inheritance: EventDispatcher → Node → TempNode →*

# PosterizeNode

Represents a posterize effect which reduces the number of colors in an image, resulting in a more blocky and stylized appearance.

## Constructor

### new PosterizeNode( sourceNode : Node, stepsNode : Node )

Constructs a new posterize node.

**sourceNode**

The input color.

**stepsNode**

Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.

## Properties

### .sourceNode : Node

The input color.

### .stepsNode : Node

Controls the intensity of the posterization effect. A lower number results in a more blocky appearance.

## Source

[src/nodes/display/PosterizeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/PosterizeNode.js)