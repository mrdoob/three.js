*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# RapierHelper

This class displays all Rapier Colliders in outline.

## Import

RapierHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { RapierHelper } from 'three/addons/helpers/RapierHelper.js';
```

## Constructor

### new RapierHelper( world : RAPIER.world )

Constructs a new Rapier debug helper.

**world**

The Rapier world to visualize.

## Properties

### .world : RAPIER.world

The Rapier world to visualize.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Call this in the render loop to update the outlines.

## Source

[examples/jsm/helpers/RapierHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/RapierHelper.js)