*Inheritance: Loader → ObjectLoader →*

# NodeObjectLoader

A special type of object loader for loading 3D objects using node materials.

## Constructor

### new NodeObjectLoader( manager : LoadingManager )

Constructs a new node object loader.

**manager**

A reference to a loading manager.

## Properties

### .nodeMaterials : Object.<string, NodeMaterial.constructor>

Represents a dictionary of node material types.

### .nodes : Object.<string, Node.constructor>

Represents a dictionary of node types.

## Methods

### .parse( json : Object, onLoad : function ) : Object3D

Parses the node objects from the given JSON.

**json**

The JSON definition

**onLoad**

The onLoad callback function.

**Overrides:** [ObjectLoader#parse](ObjectLoader.html#parse)

**Returns:** . The parsed 3D object.

### .parseMaterials( json : Object, textures : Object.<string, Texture> ) : Object.<string, NodeMaterial>

Parses the node objects from the given JSON and textures.

**json**

The JSON definition

**textures**

The texture library.

**Returns:** . The parsed materials.

### .parseNodes( json : Array.<Object>, textures : Object.<string, Texture> ) : Object.<string, Node>

Parses the node objects from the given JSON and textures.

**json**

The JSON definition

**textures**

The texture library.

**Returns:** . The parsed nodes.

### .setNodeMaterials( value : Object.<string, NodeMaterial.constructor> ) : NodeObjectLoader

Defines the dictionary of node material types.

**value**

The node material library defined as `<classname,class>`.

**Returns:** A reference to this loader.

### .setNodes( value : Object.<string, Node.constructor> ) : NodeObjectLoader

Defines the dictionary of node types.

**value**

The node library defined as `<classname,class>`.

**Returns:** A reference to this loader.

## Source

[src/loaders/nodes/NodeObjectLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/nodes/NodeObjectLoader.js)