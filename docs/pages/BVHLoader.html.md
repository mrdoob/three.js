*Inheritance: Loader →*

# BVHLoader

A loader for the BVH format.

Imports BVH files and outputs a single [Skeleton](Skeleton.html) and [AnimationClip](AnimationClip.html). The loader only supports BVH files containing a single root right now.

## Code Example

```js
const loader = new BVHLoader();
const result = await loader.loadAsync( 'models/bvh/pirouette.bvh' );
// visualize skeleton
const skeletonHelper = new THREE.SkeletonHelper( result.skeleton.bones[ 0 ] );
scene.add( result.skeleton.bones[ 0 ] );
scene.add( skeletonHelper );
// play animation clip
mixer = new THREE.AnimationMixer( result.skeleton.bones[ 0 ] );
mixer.clipAction( result.clip ).play();
```

## Import

BVHLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { BVHLoader } from 'three/addons/loaders/BVHLoader.js';
```

## Constructor

### new BVHLoader( manager : LoadingManager )

Constructs a new BVH loader.

**manager**

The loading manager.

## Properties

### .animateBonePositions : boolean

Whether to animate bone positions or not.

Default is `true`.

### .animateBoneRotations : boolean

Whether to animate bone rotations or not.

Default is `true`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded BVH asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( text : string ) : Object

Parses the given BVH data and returns the resulting data.

**text**

The raw BVH data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** An object representing the parsed asset.

## Source

[examples/jsm/loaders/BVHLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/BVHLoader.js)