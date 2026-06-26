*Inheritance: EventDispatcher → Object3D → Group →*

# TileShadowNodeHelper

Helper class to manage and display debug visuals for TileShadowNode.

## Import

TileShadowNodeHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TileShadowNodeHelper } from 'three/addons/tsl/shadows/TileShadowNodeHelper.js';
```

## Constructor

### new TileShadowNodeHelper( tileShadowNode : TileShadowNode )

**tileShadowNode**

The TileShadowNode instance to debug.

## Methods

### .dispose()

Removes all debug objects (planes and helpers) from the scene.

### .init()

Initializes the debug displays (planes and camera helpers). Should be called after TileShadowNode has initialized its lights and shadow nodes.

### .update()

Updates the debug visuals (specifically camera helpers). Should be called within TileShadowNode's update method.

## Source

[examples/jsm/tsl/shadows/TileShadowNodeHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/shadows/TileShadowNodeHelper.js)