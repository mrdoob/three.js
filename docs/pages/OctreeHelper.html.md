*Inheritance: EventDispatcher → Object3D → Line → LineSegments →*

# OctreeHelper

A helper for visualizing an Octree.

## Code Example

```js
const helper = new OctreeHelper( octree );
scene.add( helper );
```

## Import

OctreeHelper is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js';
```

## Constructor

### new OctreeHelper( octree : Octree, color : number | Color | string )

Constructs a new Octree helper.

**octree**

The octree to visualize.

**color**

The helper's color.

Default is `0xffff00`.

## Properties

### .color : number | Color | string

The helper's color.

### .octree : Octree

The octree to visualize.

## Methods

### .dispose()

Frees the GPU-related resources allocated by this instance. Call this method whenever this instance is no longer used in your app.

### .update()

Updates the helper. This method must be called whenever the Octree's structure is changed.

## Source

[examples/jsm/helpers/OctreeHelper.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/helpers/OctreeHelper.js)