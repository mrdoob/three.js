*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode → SpotLightNode →*

# IESSpotLightNode

An IES version of the default spot light node.

## Constructor

### new IESSpotLightNode()

## Methods

### .getSpotAttenuation( builder : NodeBuilder, angleCosine : Node.<float> ) : Node.<float>

Overwrites the default implementation to compute an IES conform spot attenuation.

**builder**

The node builder.

**angleCosine**

The angle to compute the spot attenuation for.

**Overrides:** [SpotLightNode#getSpotAttenuation](SpotLightNode.html#getSpotAttenuation)

**Returns:** The spot attenuation.

## Source

[src/nodes/lighting/IESSpotLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/IESSpotLightNode.js)