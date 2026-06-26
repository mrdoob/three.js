*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode →*

# SpotLightNode

Module for representing spot lights as nodes.

## Constructor

### new SpotLightNode( light : SpotLight )

Constructs a new spot light node.

**light**

The spot light source.

Default is `null`.

## Properties

### .colorNode : UniformNode.<Color>

Uniform node representing the light color.

**Overrides:** [AnalyticLightNode#colorNode](AnalyticLightNode.html#colorNode)

### .coneCosNode : UniformNode.<float>

Uniform node representing the cone cosine.

### .cutoffDistanceNode : UniformNode.<float>

Uniform node representing the cutoff distance.

### .decayExponentNode : UniformNode.<float>

Uniform node representing the decay exponent.

### .penumbraCosNode : UniformNode.<float>

Uniform node representing the penumbra cosine.

## Methods

### .getSpotAttenuation( builder : NodeBuilder, angleCosine : Node.<float> ) : Node.<float>

Computes the spot attenuation for the given angle.

**builder**

The node builder.

**angleCosine**

The angle to compute the spot attenuation for.

**Returns:** The spot attenuation.

### .update( frame : NodeFrame )

Overwritten to updated spot light specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [AnalyticLightNode#update](AnalyticLightNode.html#update)

## Source

[src/nodes/lighting/SpotLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/SpotLightNode.js)