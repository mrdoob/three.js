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

### .setupShadowPosition( object : NodeBuilder )

Setups the shadow position node which is by default the predefined TSL node object `shadowPositionWorld`.

**object**

A configuration object that must at least hold a material reference.

## Source

[src/nodes/lighting/ShadowBaseNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/lighting/ShadowBaseNode.js)