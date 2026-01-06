*Inheritance: EventDispatcher → Node →*

# SceneNode

This module allows access to a collection of scene properties. The following predefined TSL objects are available for easier use:

*   `backgroundBlurriness`: A node that represents the scene's background blurriness.
*   `backgroundIntensity`: A node that represents the scene's background intensity.
*   `backgroundRotation`: A node that represents the scene's background rotation.

## Constructor

### new SceneNode( scope : 'backgroundBlurriness' | 'backgroundIntensity' | 'backgroundRotation', scene : Scene )

Constructs a new scene node.

**scope**

The scope defines the type of scene property that is accessed.

**scene**

A reference to the scene.

Default is `null`.

## Properties

### .scene : Scene

A reference to the scene that is going to be accessed.

Default is `null`.

### .scope : 'backgroundBlurriness' | 'backgroundIntensity' | 'backgroundRotation'

The scope defines the type of scene property that is accessed.

## Methods

### .setup( builder : NodeBuilder ) : Node

Depending on the scope, the method returns a different type of node that represents the respective scene property.

**builder**

The current node builder.

**Overrides:** [Node#setup](Node.html#setup)

**Returns:** The output node.

## Source

[src/nodes/accessors/SceneNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/SceneNode.js)