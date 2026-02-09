*Inheritance: EventDispatcher → Node → LightingNode →*

# AnalyticLightNode

Base class for analytic light nodes.

## Constructor

### new AnalyticLightNode( light : Light )

Constructs a new analytic light node.

**light**

The light source.

Default is `null`.

## Properties

### .baseColorNode : Node

This property is used to retain a reference to the original value of [AnalyticLightNode#colorNode](AnalyticLightNode.html#colorNode). The final color node is represented by a different node when using shadows.

Default is `null`.

### .color : Color

The light's color value.

### .colorNode : Node

The light's color node. Points to `colorNode` of the light source, if set. Otherwise it creates a uniform node based on [AnalyticLightNode#color](AnalyticLightNode.html#color).

### .isAnalyticLightNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .light : Light

The light source.

Default is `null`.

### .shadowColorNode : Node

Represents the light's shadow color.

Default is `null`.

### .shadowNode : ShadowNode

Represents the light's shadow.

Default is `null`.

### .updateType : string

Overwritten since analytic light nodes are updated once per frame.

Default is `'frame'`.

**Overrides:** [LightingNode#updateType](LightingNode.html#updateType)

## Methods

### .disposeShadow()

Frees internal resources related to shadows.

### .getLightVector( builder : NodeBuilder ) : Node.<vec3>

Returns a node representing a direction vector which points from the current position in view space to the light's position in view space.

**builder**

The builder object used for setting up the light.

**Returns:** The light vector node.

### .setup( builder : NodeBuilder )

Unlike most other nodes, lighting nodes do not return a output node in [Node#setup](Node.html#setup). The main purpose of lighting nodes is to configure the current [LightingModel](LightingModel.html) and/or invocate the respective interface methods.

**builder**

The current node builder.

**Overrides:** [LightingNode#setup](LightingNode.html#setup)

### .setupDirect( builder : NodeBuilder ) : Object | undefined (abstract)

Sets up the direct lighting for the analytic light node.

**builder**

The builder object used for setting up the light.

**Returns:** The direct light data (color and direction).

### .setupDirectRectArea( builder : NodeBuilder ) : Object | undefined (abstract)

Sets up the direct rect area lighting for the analytic light node.

**builder**

The builder object used for setting up the light.

**Returns:** The direct rect area light data.

### .setupShadow( builder : NodeBuilder )

Setups the shadow for this light. This method is only executed if the light cast shadows and the current build object receives shadows. It incorporates shadows into the lighting computation.

**builder**

The current node builder.

### .setupShadowNode() : ShadowNode

Setups the shadow node for this light. The method exists so concrete light classes can setup different types of shadow nodes.

**Returns:** The created shadow node.

### .update( frame : NodeFrame )

The update method is used to update light uniforms per frame. Potentially overwritten in concrete light nodes to update light specific uniforms.

**frame**

A reference to the current node frame.

**Overrides:** [LightingNode#update](LightingNode.html#update)

## Source

[src/nodes/lighting/AnalyticLightNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/AnalyticLightNode.js)