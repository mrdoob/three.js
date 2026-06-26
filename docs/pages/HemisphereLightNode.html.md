*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode →*

# HemisphereLightNode

Module for representing hemisphere lights as nodes.

## Constructor

### new HemisphereLightNode( light : HemisphereLight )

Constructs a new hemisphere light node.

**light**

The hemisphere light source.

Default is `null`.

## Properties

### .groundColorNode : UniformNode.<vec3>

Uniform node representing the light's ground color.

### .lightDirectionNode : Node.<vec3>

A node representing the light's direction.

### .lightPositionNode : UniformNode.<vec3>

Uniform node representing the light's position.

## Methods

### .update( frame : NodeFrame )

Overwritten to updated hemisphere light specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [AnalyticLightNode#update](AnalyticLightNode.html#update)

## Source

[src/nodes/lighting/HemisphereLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/HemisphereLightNode.js)