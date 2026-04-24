*Inheritance: EventDispatcher → Node → LightingNode → AnalyticLightNode →*

# RectAreaLightNode

Module for representing rect area lights as nodes.

## Constructor

### new RectAreaLightNode( light : RectAreaLight )

Constructs a new rect area light node.

**light**

The rect area light source.

Default is `null`.

## Properties

### .halfHeight : UniformNode.<vec3>

Uniform node representing the half height of the are light.

### .halfWidth : UniformNode.<vec3>

Uniform node representing the half width of the are light.

### .updateType : string

The `updateType` is set to `NodeUpdateType.RENDER` since the light relies on `viewMatrix` which might vary per render call.

Default is `'render'`.

**Overrides:** [AnalyticLightNode#updateType](AnalyticLightNode.html#updateType)

## Methods

### .update( frame : NodeFrame )

Overwritten to updated rect area light specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [AnalyticLightNode#update](AnalyticLightNode.html#update)

## Static Methods

### .setLTC( ltc : RectAreaLightTexturesLib )

Used to configure the internal BRDF approximation texture data.

**ltc**

The BRDF approximation texture data.

## Source

[src/nodes/lighting/RectAreaLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/RectAreaLightNode.js)