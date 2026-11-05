*Inheritance: EventDispatcher → Node → LightsNode →*

# ClusteredLightsNode

A custom version of `LightsNode` implementing Forward+ clustered shading: the view frustum is subdivided into a 3D grid of clusters (X × Y screen tiles times an exponentially-spaced set of Z depth slices), and each cluster holds only the point and spot lights whose bounding spheres intersect it. At shading time each fragment looks up its cluster and loops over just that cluster's lights. Unlike 2D tiled lighting, clustered shading culls lights that share screen pixels but lie at different depths — suitable for 3D scenes with real depth complexity.

## Import

ClusteredLightsNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#installation#addons).

```js
import { clusteredLights } from 'three/addons/tsl/lighting/ClusteredLightsNode.js';
```

## Constructor

### new ClusteredLightsNode( maxLights : number, tileSize : number, zSlices : number, maxLightsPerCluster : number )

Constructs a new clustered lights node.

**maxLights**

Maximum number of point and spot lights.

Default is `1024`.

**tileSize**

Screen tile size in pixels (cluster XY size).

Default is `32`.

**zSlices**

Number of exponential depth slices.

Default is `24`.

**maxLightsPerCluster**

Per-cluster light-list capacity.

Default is `64`.

## Properties

### .isClusteredLightsNode : boolean (readonly)

This flag can be used for type testing.

Default is `true`.

## Methods

### .customCacheKey() : number

Overwrites the default [LightsNode#customCacheKey](LightsNode.html#customCacheKey) implementation by including the node identity and resource version into the cache key.

**Overrides:** [LightsNode#customCacheKey](LightsNode.html#customCacheKey)

**Returns:** The custom cache key.

### .dispose()

Frees the GPU resources allocated by this node.

**Overrides:** [LightsNode#dispose](LightsNode.html#dispose)

### .getBuiltinLights() : Array.<Light>

Returns the lights that are not clustered.

**Overrides:** [LightsNode#getBuiltinLights](LightsNode.html#getBuiltinLights)

**Returns:** The lights using the default lighting.

### .getClusterLightCount( zSliceNode : Node.<int> ) : Node.<int>

Returns the number of lights in the fragment's cluster. Useful for debugging.

**zSliceNode**

The depth slice to inspect. A negative value selects the fragment's own cluster.

**Returns:** The light count.

### .setLights( lights : Array.<Light> ) : ClusteredLightsNode

Configures this node with an array of lights. Point and spot lights without shadows are clustered (except lights with a `colorNode`, spot lights with a projected `map` and light types with their own light node, like `IESSpotLight` or `ProjectorLight`), all other lights use the default lighting.

**lights**

An array of lights.

**Overrides:** [LightsNode#setLights](LightsNode.html#setLights)

**Returns:** A reference to this node.

### .setSize( width : number, height : number ) : ClusteredLightsNode

Sets the size of the cluster grid. Must be called outside of rendering. Not required with [ClusteredLighting](ClusteredLighting.html), which fits the grid at the beginning of each render.

**width**

The drawing buffer width.

**height**

The drawing buffer height.

**Returns:** A reference to this node.

### .setupLights( builder : NodeBuilder, lightNodes : Array.<LightingNode> )

Sets up the default lights and the clustered point and spot lights.

**builder**

A reference to the current node builder.

**lightNodes**

An array of lighting nodes.

**Overrides:** [LightsNode#setupLights](LightsNode.html#setupLights)

### .updateBefore( frame : NodeFrame )

Updates the light data and assigns the lights to the clusters.

**frame**

A reference to the current node frame.

**Overrides:** [LightsNode#updateBefore](LightsNode.html#updateBefore)

### .updateSize()

Fits the cluster grid to the framebuffer of the render that is about to start. Called by [ClusteredLighting](ClusteredLighting.html) before the render objects of the render are prepared. Since each render depth has its own node, no pending command buffer uses the resources of this node at this point, so a rebuild can free the replaced resources immediately.

## Source

[examples/jsm/tsl/lighting/ClusteredLightsNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/lighting/ClusteredLightsNode.js)