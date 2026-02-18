*Inheritance: EventDispatcher → Node → TempNode →*

# ColorSpaceNode

This node represents a color space conversion. Meaning it converts a color value from a source to a target color space.

## Constructor

### new ColorSpaceNode( colorNode : Node, source : string, target : string )

Constructs a new color space node.

**colorNode**

Represents the color to convert.

**source**

The source color space.

**target**

The target color space.

## Properties

### .colorNode : Node

Represents the color to convert.

### .source : string

The source color space.

### .target : string

The target color space.

## Methods

### .resolveColorSpace( builder : NodeBuilder, colorSpace : string ) : string

This method resolves the constants `WORKING_COLOR_SPACE` and `OUTPUT_COLOR_SPACE` based on the current configuration of the color management and renderer.

**builder**

The current node builder.

**colorSpace**

The color space to resolve.

**Returns:** The resolved color space.

## Source

[src/nodes/display/ColorSpaceNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/display/ColorSpaceNode.js)