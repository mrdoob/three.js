*Inheritance: EventDispatcher → Node → TempNode →*

# PixelationNode

A inner node definition that implements the actual pixelation TSL code.

## Constructor

### new PixelationNode( textureNode : TextureNode, depthNode : TextureNode, normalNode : TextureNode, pixelSize : Node.<float>, normalEdgeStrength : Node.<float>, depthEdgeStrength : Node.<float> )

Constructs a new pixelation node.

**textureNode**

The texture node that represents the beauty pass.

**depthNode**

The texture that represents the beauty's depth.

**normalNode**

The texture that represents the beauty's normals.

**pixelSize**

The pixel size.

**normalEdgeStrength**

The normal edge strength.

**depthEdgeStrength**

The depth edge strength.

## Properties

### .depthEdgeStrength : Node.<float>

The depth edge strength.

### .depthNode : TextureNode

The texture that represents the beauty's depth.

### .normalEdgeStrength : Node.<float>

The pixel size.

### .normalNode : TextureNode

The texture that represents the beauty's normals.

### .pixelSize : Node.<float>

The pixel size.

### .textureNode : TextureNode

The texture node that represents the beauty pass.

### .updateType : string

The `updateType` is set to `NodeUpdateType.FRAME` since the node updates its internal uniforms once per frame in `updateBefore()`.

Default is `'frame'`.

**Overrides:** [TempNode#updateType](TempNode.html#updateType)

## Methods

### .setup( builder : NodeBuilder ) : ShaderCallNodeInternal

This method is used to setup the effect's TSL code.

**builder**

The current node builder.

**Overrides:** [TempNode#setup](TempNode.html#setup)

### .update( frame : NodeFrame )

This method is used to update uniforms once per frame.

**frame**

The current node frame.

**Overrides:** [TempNode#update](TempNode.html#update)

## Source

[examples/jsm/tsl/display/PixelationPassNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/PixelationPassNode.js)