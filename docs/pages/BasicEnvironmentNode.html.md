*Inheritance: EventDispatcher → Node → LightingNode →*

# BasicEnvironmentNode

Represents a basic model for Image-based lighting (IBL). The environment is defined via environment maps in the equirectangular or cube map format. `BasicEnvironmentNode` is intended for non-PBR materials like [MeshBasicNodeMaterial](MeshBasicNodeMaterial.html) or [MeshPhongNodeMaterial](MeshPhongNodeMaterial.html).

## Constructor

### new BasicEnvironmentNode( envNode : Node )

Constructs a new basic environment node.

**envNode**

A node representing the environment.

Default is `null`.

## Properties

### .envNode : Node

A node representing the environment.

Default is `null`.

## Source

[src/nodes/lighting/BasicEnvironmentNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/BasicEnvironmentNode.js)