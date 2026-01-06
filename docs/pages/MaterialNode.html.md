*Inheritance: EventDispatcher → Node →*

# MaterialNode

This class should simplify the node access to material properties. It internal uses reference nodes to make sure changes to material properties are automatically reflected to predefined TSL objects like e.g. `materialColor`.

## Constructor

### new MaterialNode( scope : string )

Constructs a new material node.

**scope**

The scope defines what kind of material property is referred by the node.

## Properties

### .scope : string

The scope defines what material property is referred by the node.

## Methods

### .getCache( property : string, type : string ) : MaterialReferenceNode

Returns a cached reference node for the given property and type.

**property**

The name of the material property.

**type**

The uniform type of the property.

**Returns:** A material reference node representing the property access.

### .getColor( property : string ) : MaterialReferenceNode.<color>

Returns a color-typed material reference node for the given property name.

**property**

The name of the material property.

**Returns:** A material reference node representing the property access.

### .getFloat( property : string ) : MaterialReferenceNode.<float>

Returns a float-typed material reference node for the given property name.

**property**

The name of the material property.

**Returns:** A material reference node representing the property access.

### .getTexture( property : string ) : MaterialReferenceNode

Returns a texture-typed material reference node for the given property name.

**property**

The name of the material property.

**Returns:** A material reference node representing the property access.

### .setup( builder : NodeBuilder ) : Node

The node setup is done depending on the selected scope. Multiple material properties might be grouped into a single node composition if they logically belong together.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The node representing the selected scope.

## Source

[src/nodes/accessors/MaterialNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/MaterialNode.js)