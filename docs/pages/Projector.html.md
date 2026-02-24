# Projector

This class can project a given scene in 3D space into a 2D representation used for rendering with a 2D API. `Projector` is currently used by [SVGRenderer](SVGRenderer.html) and was previously used by the legacy `CanvasRenderer`.

## Import

Projector is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { Projector } from 'three/addons/renderers/Projector.js';
```

## Constructor

### new Projector()

Constructs a new projector.

## Methods

### .projectScene( scene : Object3D, camera : Camera, sortObjects : boolean, sortElements : boolean ) : Object

Projects the given scene in 3D space into a 2D representation. The result is an object with renderable items.

**scene**

A scene or any other type of 3D object.

**camera**

The camera.

**sortObjects**

Whether to sort objects or not.

**sortElements**

Whether to sort elements (faces, lines and sprites) or not.

**Returns:** The projected scene as renderable objects.

## Source

[examples/jsm/renderers/Projector.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/renderers/Projector.js)