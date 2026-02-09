*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode → SpotLightNode →*

# ProjectorLightNode

An implementation of a projector light node.

## Constructor

### new ProjectorLightNode()

## Methods

### .getSpotAttenuation( builder : NodeBuilder ) : Node.<float>

Overwrites the default implementation to compute projection attenuation.

**builder**

The node builder.

**Overrides:** [SpotLightNode#getSpotAttenuation](SpotLightNode.html#getSpotAttenuation)

**Returns:** The spot attenuation.

## Source

[src/nodes/lighting/ProjectorLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/ProjectorLightNode.js)