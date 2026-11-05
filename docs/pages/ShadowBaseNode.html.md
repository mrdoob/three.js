*Inheritance: EventDispatcher → Node →*

# ShadowBaseNode

Base class for all shadow nodes.

Shadow nodes encapsulate shadow related logic and are always coupled to lighting nodes. Lighting nodes might share the same shadow node type or use specific ones depending on their requirements.

## Constructor

### new ShadowBaseNode( light : Light )

Constructs a new shadow base node.

**light**

The shadow casting light.

## Properties

### .isShadowBaseNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

### .light : Light

The shadow casting light.

### .updateBeforeType : string

Overwritten since shadows are updated by default per render.

Default is `'render'`.

**Overrides:** [Node#updateBeforeType](Node.html#updateBeforeType)

## Methods

### .disposeShadowMaterial()

Disposes the shadow material for the shadow casting light source.

### .getShadowMaterial() : NodeMaterial

Retrieves or creates a shadow material for the shadow casting light source.

This method checks if a shadow material already exists for the provided light in the internal library. If not, it creates a new `NodeMaterial` configured for shadow rendering and stores it for future use.

**Returns:** The shadow material associated with the given light.

### .getShadowRenderObjectFunction( renderer : Renderer, shadow : LightShadow ) : function

Returns a function to render shadow objects in a scene for the given light shadow and renderer.

**renderer**

The renderer.

**shadow**

The light shadow object containing shadow properties.

Default is `this.light.shadow`.

**Returns:** A function that renders shadow objects.

### .setupShadowPosition( object : NodeBuilder )

Setups the shadow position node which is by default the predefined TSL node object `shadowPositionWorld`.

**object**

A configuration object that must at least hold a material reference.

## Source

[src/nodes/lighting/ShadowBaseNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/ShadowBaseNode.js)