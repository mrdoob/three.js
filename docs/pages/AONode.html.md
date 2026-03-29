*Inheritance: EventDispatcher → Node → LightingNode →*

# AONode

A generic class that can be used by nodes which contribute ambient occlusion to the scene. E.g. an ambient occlusion map node can be used as input for this module. Used in [NodeMaterial](NodeMaterial.html).

## Constructor

### new AONode( aoNode : Node.<float> )

Constructs a new AO node.

**aoNode**

The ambient occlusion node.

Default is `null`.

## Properties

### .aoNode : Node.<float>

The ambient occlusion node.

Default is `null`.

## Source

[src/nodes/lighting/AONode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/AONode.js)