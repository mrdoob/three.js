*Inheritance: Loader → MaterialLoader →*

# NodeMaterialLoader

A special type of material loader for loading node materials.

## Constructor

### new NodeMaterialLoader( manager : LoadingManager )

Constructs a new node material loader.

**manager**

A reference to a loading manager.

## Properties

### .nodeMaterials : Object.<string, NodeMaterial.constructor>

Represents a dictionary of node material types.

### .nodes : Object.<string, Node.constructor>

Represents a dictionary of node types.

## Methods

### .createMaterialFromType( type : string ) : Node

Creates a node material from the given type.

**type**

The node material type.

**Overrides:** [MaterialLoader#createMaterialFromType](MaterialLoader.html#createMaterialFromType)

**Returns:** The created node material instance.

### .parse( json : Object ) : NodeMaterial

Parses the node material from the given JSON.

**json**

The JSON definition

**Overrides:** [MaterialLoader#parse](MaterialLoader.html#parse)

**Returns:** . The parsed material.

### .setNodeMaterials( value : Object.<string, NodeMaterial.constructor> ) : NodeLoader

Defines the dictionary of node material types.

**value**

The node material library defined as `<classname,class>`.

**Returns:** A reference to this loader.

### .setNodes( value : Object.<string, Node.constructor> ) : NodeLoader

Defines the dictionary of node types.

**value**

The node library defined as `<classname,class>`.

**Returns:** A reference to this loader.

## Source

[src/loaders/nodes/NodeMaterialLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/nodes/NodeMaterialLoader.js)