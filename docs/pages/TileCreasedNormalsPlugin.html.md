# TileCreasedNormalsPlugin

A plugin for `3d-tiles-renderer` that computes creased vertex normals for the geometry of each loaded tile: smooth normals everywhere except where faces meet at an angle greater than the crease angle. Useful for photogrammetry tile sets like Google Photorealistic 3D Tiles which come without vertex normals.

The normals are computed in a Web Worker so tile processing doesn't block the main thread. Tiles are displayed once their normals are ready.

## Code Example

```js
tiles.registerPlugin( new TileCreasedNormalsPlugin( { creaseAngle: Math.PI / 6 } ) );
```

## Import

TileCreasedNormalsPlugin is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TileCreasedNormalsPlugin } from 'three/addons/misc/TileCreasedNormalsPlugin.js';
```

## Constructor

### new TileCreasedNormalsPlugin( options : Object )

Constructs a new plugin.

**options**

The configuration options.

**creaseAngle**

The crease angle in radians.

Default is `Math.PI/3`.

## Properties

### .creaseAngle : number

The crease angle in radians.

## Methods

### .dispose()

Called by the tiles renderer when the plugin is unregistered or the tiles renderer is disposed.

### .processTileModel( scene : Object3D ) : Promise

Called by the tiles renderer for each loaded tile model. The tile is displayed once the returned promise resolves.

**scene**

The tile model.

**Returns:** A promise that resolves when all geometries have creased normals.

## Source

[examples/jsm/misc/TileCreasedNormalsPlugin.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/misc/TileCreasedNormalsPlugin.js)