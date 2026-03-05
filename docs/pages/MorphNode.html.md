*Inheritance: EventDispatcher → Node →*

# MorphNode

This node implements the vertex transformation shader logic which is required for morph target animation.

## Constructor

### new MorphNode( mesh : Mesh )

Constructs a new morph node.

**mesh**

The mesh holding the morph targets.

## Properties

### .mesh : Mesh

The mesh holding the morph targets.

### .morphBaseInfluence : UniformNode.<float>

A uniform node which represents the morph base influence value.

### .updateType : string

The update type overwritten since morph nodes are updated per object.

**Overrides:** [Node#updateType](Node.html#updateType)

## Methods

### .setup( builder : NodeBuilder )

Setups the morph node by assigning the transformed vertex data to predefined node variables.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

### .update( frame : NodeFrame )

Updates the state of the morphed mesh by updating the base influence.

**frame**

The current node frame.

**Overrides:** [Node#update](Node.html#update)

## Source

[src/nodes/accessors/MorphNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/MorphNode.js)