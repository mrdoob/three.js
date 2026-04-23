# NodeCache

This utility class is used in [NodeBuilder](NodeBuilder.html) as an internal cache data structure for node data.

## Constructor

### new NodeCache( parent : NodeCache )

Constructs a new node cache.

**parent**

A reference to a parent cache.

Default is `null`.

## Properties

### .id : number (readonly)

The id of the cache.

### .nodesData : WeakMap.<Node, Object>

A weak map for managing node data.

### .parent : NodeCache

Reference to a parent node cache.

Default is `null`.

## Methods

### .getData( node : Node ) : Object

Returns the data for the given node.

**node**

The node.

**Returns:** The data for the node.

### .setData( node : Node, data : Object )

Sets the data for a given node.

**node**

The node.

**data**

The data that should be cached.

## Source

[src/nodes/core/NodeCache.js](https://github.com/mrdoob/three.js/blob/master/src/nodes/core/NodeCache.js)