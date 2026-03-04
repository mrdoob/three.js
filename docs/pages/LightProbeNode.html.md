*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode →*

# LightProbeNode

Module for representing light probes as nodes.

## Constructor

### new LightProbeNode( light : LightProbe )

Constructs a new light probe node.

**light**

The light probe.

Default is `null`.

## Properties

### .lightProbe : UniformArrayNode

Light probe represented as a uniform of spherical harmonics.

## Methods

### .update( frame : NodeFrame )

Overwritten to updated light probe specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [AnalyticLightNode#update](AnalyticLightNode.html#update)

## Source

[src/nodes/lighting/LightProbeNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/LightProbeNode.js)