*Inheritance: EventDispatcher → Node → Object3DNode →*

# ModelNode

This type of node is a specialized version of `Object3DNode` with larger set of model related metrics. Unlike `Object3DNode`, `ModelNode` extracts the reference to the 3D object from the current node frame state.

## Constructor

### new ModelNode( scope : 'position' | 'viewPosition' | 'direction' | 'scale' | 'worldMatrix' )

Constructs a new object model node.

**scope**

The node represents a different type of transformation depending on the scope.

## Methods

### .update( frame : NodeFrame )

Extracts the model reference from the frame state and then updates the uniform value depending on the scope.

**frame**

The current node frame.

**Overrides:** [Object3DNode#update](Object3DNode.html#update)

## Source

[src/nodes/accessors/ModelNode.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/accessors/ModelNode.js)