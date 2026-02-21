*Inheritance: EventDispatcher → Node → ShadowBaseNode →*

# TileShadowNode

A class that extends `ShadowBaseNode` to implement tiled shadow mapping. This allows splitting a shadow map into multiple tiles, each with its own light and camera, to improve shadow quality and performance for large scenes.

**Note:** This class does not support `VSMShadowMap` at the moment.

## Import

TileShadowNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TileShadowNode } from 'three/addons/tsl/shadows/TileShadowNode.js';
```

## Constructor

### new TileShadowNode( light : Light, options : Object )

Creates an instance of `TileShadowNode`.

**light**

The original light source used for shadow mapping.

**options**

Configuration options for the tiled shadow node.

Default is `{}`.

**tilesX**

The number of tiles along the X-axis.

Default is `2`.

**tilesY**

The number of tiles along the Y-axis.

Default is `2`.

**resolution**

The resolution of the shadow map.

**debug**

Whether to enable debug mode.

Default is `false`.

## Methods

### .disposeLightsAndNodes()

Helper method to remove lights and associated nodes/targets. Used internally during dispose and potential re-initialization.

### .generateTiles( tilesX : number, tilesY : number ) : Array.<Object>

Generates the tiles for the shadow map based on the specified number of tiles along the X and Y axes.

**tilesX**

The number of tiles along the X-axis.

**tilesY**

The number of tiles along the Y-axis.

**Returns:** An array of tile objects, each containing the tile's bounds and index.

### .init( builder : Builder )

Initializes the tiled shadow node by creating lights, cameras, and shadow maps for each tile.

**builder**

The builder used to create render targets and other resources.

### .setup( builder : Builder ) : Node

Sets up the shadow node for rendering.

**builder**

The builder used to set up the shadow node.

**Overrides:** [ShadowBaseNode#setup](ShadowBaseNode.html#setup)

**Returns:** A node representing the shadow value.

### .syncLightTransformation( lwLight : LwLight, sourceLight : Light )

Synchronizes the transformation of a tile light with the source light.

**lwLight**

The tile light to synchronize.

**sourceLight**

The source light to copy transformations from.

### .update()

Updates the light transformations and shadow cameras for each tile.

**Overrides:** [ShadowBaseNode#update](ShadowBaseNode.html#update)

### .updateBefore( frame : NodeFrame )

The implementation performs the update of the shadow map if necessary.

**frame**

A reference to the current node frame.

**Overrides:** [ShadowBaseNode#updateBefore](ShadowBaseNode.html#updateBefore)

### .updateLightDirection()

Updates the initial light direction based on the light's target position.

### .updateShadow( frame : NodeFrame )

Updates the shadow map rendering.

**frame**

A reference to the current node frame.

## Source

[examples/jsm/tsl/shadows/TileShadowNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/shadows/TileShadowNode.js)