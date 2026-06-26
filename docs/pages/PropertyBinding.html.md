# PropertyBinding

This holds a reference to a real property in the scene graph; used internally.

## Constructor

### new PropertyBinding( rootNode : Object, path : string, parsedPath : Object )

Constructs a new property binding.

**rootNode**

The root node.

**path**

The path.

**parsedPath**

The parsed path.

## Properties

### .node : Object

The object owns the animated property.

### .parsedPath : Object

An object holding information about the path.

### .path : string

The object path to the animated property.

### .rootNode : Object3D | Skeleton

The root node.

## Methods

### .bind()

Creates a getter / setter pair for the property tracked by this binding.

### .unbind()

Unbinds the property.

## Static Methods

### .create( root : Object, path : string, parsedPath : Object ) : PropertyBinding | Composite

Factory method for creating a property binding from the given parameters.

**root**

The root node.

**path**

The path.

**parsedPath**

The parsed path.

**Returns:** The created property binding or composite.

### .findNode( root : Object, nodeName : string | number ) : Object

Searches for a node in the hierarchy of the given root object by the given node name.

**root**

The root object.

**nodeName**

The name of the node.

**Returns:** The found node. Returns `null` if no object was found.

### .parseTrackName( trackName : string ) : Object

Parses the given track name (an object path to an animated property) and returns an object with information about the path. Matches strings in the following forms:

*   nodeName.property
*   nodeName.property\[accessor\]
*   nodeName.material.property\[accessor\]
*   uuid.property\[accessor\]
*   uuid.objectName\[objectIndex\].propertyName\[propertyIndex\]
*   parentName/nodeName.property
*   parentName/parentName/nodeName.property\[index\]
*   .bone\[Armature.DEF\_cog\].position
*   scene:helium\_balloon\_model:helium\_balloon\_model.position

**trackName**

The track name to parse.

**Returns:** The parsed track name as an object.

### .sanitizeNodeName( name : string ) : string

Replaces spaces with underscores and removes unsupported characters from node names, to ensure compatibility with parseTrackName().

**name**

Node name to be sanitized.

**Returns:** The sanitized node name.

## Source

[src/animation/PropertyBinding.js](https://github.com/mrdoob/three.js/blob/master/src/animation/PropertyBinding.js)