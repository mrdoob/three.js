*Inheritance: EventDispatcher → Node → LightsNode →*

# ClusteredLightsNode

A custom version of `LightsNode` implementing Forward+ clustered shading: the view frustum is subdivided into a 3D grid of clusters (X × Y screen tiles times an exponentially-spaced set of Z depth slices), and each cluster holds only the point lights whose spheres intersect it. At shading time each fragment looks up its cluster and loops over just that cluster's lights. Unlike 2D tiled lighting, clustered shading culls lights that share screen pixels but lie at different depths — suitable for 3D scenes with real depth complexity.

## Import

ClusteredLightsNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { clusteredLights } from 'three/addons/tsl/lighting/ClusteredLightsNode.js';
```

## Constructor

### new ClusteredLightsNode( maxLights : number, tileSize : number, zSlices : number, maxLightsPerCluster : number )

Constructs a new clustered lights node.

**maxLights**

Maximum number of point lights.

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

## Source

[examples/jsm/tsl/lighting/ClusteredLightsNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/lighting/ClusteredLightsNode.js)