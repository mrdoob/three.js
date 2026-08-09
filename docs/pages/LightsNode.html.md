*Inheritance: EventDispatcher → Node →*

# LightsNode

This node represents the scene's lighting and manages the lighting model's life cycle for the current build 3D object. It is responsible for computing the total outgoing light in a given lighting context.

## Constructor

### new LightsNode()

Constructs a new lights node.

## Properties

### .global : boolean

`LightsNode` sets this property to `true` by default.

Default is `true`.

**Overrides:** [Node#global](Node.html#global)

### .hasLights : boolean

Whether the scene has lights or not.

### .outgoingLightNode : Node.<vec3>

A node representing the outgoing light.

### .totalDiffuseNode : Node.<vec3>

A node representing the total diffuse light.

### .totalSpecularNode : Node.<vec3>

A node representing the total specular light.

## Methods

### .analyze( builder : NodeBuilder )

Analyzes the node's dependencies by building all nested light nodes and the output node.

**builder**

A reference to the current node builder.

**Overrides:** [Node#analyze](Node.html#analyze)

### .customCacheKey() : number

Overwrites the default [Node#customCacheKey](Node.html#customCacheKey) implementation by including light data into the cache key.

**Overrides:** [Node#customCacheKey](Node.html#customCacheKey)

**Returns:** The custom cache key.

### .getHash( builder : NodeBuilder ) : string

Computes a hash value for identifying the current light nodes setup.

**builder**

A reference to the current node builder.

**Overrides:** [Node#getHash](Node.html#getHash)

**Returns:** The computed hash.

### .getLights() : Array.<Light>

Returns an array of the scene's lights.

**Returns:** The scene's lights.

### .setLights( lights : Array.<Light> ) : LightsNode

Configures this node with an array of lights.

**lights**

An array of lights.

**Returns:** A reference to this node.

### .setup( builder : NodeBuilder ) : Node.<vec3>

The implementation makes sure that for each light in the scene there is a corresponding light node. By building the light nodes and evaluating the lighting model the outgoing light is computed.

**builder**

A reference to the current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** A node representing the outgoing light.

### .setupDirectLight( builder : Object, lightNode : Object, lightData : Object )

Sets up a direct light in the lighting model.

**builder**

The builder object containing the context and stack.

**lightNode**

The light node.

**lightData**

The light object containing color and direction properties.

### .setupDirectRectAreaLight( builder : Object, lightNode : Object, lightData : Object )

Sets up a direct rect area light in the lighting model.

**builder**

The builder object containing the context and stack.

**lightNode**

The light node.

**lightData**

The light object containing color and area light properties.

### .setupLights( builder : NodeBuilder, lightNodes : Array.<LightingNode> )

Setups the internal lights by building all respective light nodes.

**builder**

A reference to the current node builder.

**lightNodes**

An array of lighting nodes.

### .setupLightsNode( builder : NodeBuilder ) : Array.<LightingNode>

Creates lighting nodes for each scene light. This makes it possible to further process lights in the node system.

**builder**

A reference to the current node builder.

**Returns:** The array of lighting nodes.

## Source

[src/nodes/lighting/LightsNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/LightsNode.js)