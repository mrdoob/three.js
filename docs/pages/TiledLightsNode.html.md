*Inheritance: EventDispatcher → Node → LightsNode →*

# TiledLightsNode

A custom version of `LightsNode` implementing tiled lighting. This node is used in [TiledLighting](TiledLighting.html) to overwrite the renderer's default lighting with a custom implementation.

## Import

TiledLightsNode is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { tiledLights } from 'three/addons/tsl/lighting/TiledLightsNode.js';
```

## Constructor

### new TiledLightsNode( maxLights : number, tileSize : number )

Constructs a new tiled lights node.

**maxLights**

The maximum number of lights.

Default is `1024`.

**tileSize**

The tile size.

Default is `32`.

## Properties

### .maxLights : number

The maximum number of lights.

Default is `1024`.

### .tileSize : number

The tile size.

Default is `32`.

## Source

[examples/jsm/tsl/lighting/TiledLightsNode.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/lighting/TiledLightsNode.js)