*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode →*

# PointLightNode

Module for representing point lights as nodes.

## Constructor

### new PointLightNode( light : PointLight )

Constructs a new point light node.

**light**

The point light source.

Default is `null`.

## Properties

### .cutoffDistanceNode : UniformNode.<float>

Uniform node representing the cutoff distance.

### .decayExponentNode : UniformNode.<float>

Uniform node representing the decay exponent.

## Methods

### .setupShadowNode() : PointShadowNode

Overwritten to setup point light specific shadow.

**Overrides:** [AnalyticLightNode#setupShadowNode](AnalyticLightNode.html#setupShadowNode)

### .update( frame : NodeFrame )

Overwritten to updated point light specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [AnalyticLightNode#update](AnalyticLightNode.html#update)

## Source

[src/nodes/lighting/PointLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/PointLightNode.js)