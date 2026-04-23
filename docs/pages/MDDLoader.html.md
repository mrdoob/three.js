*Inheritance: Loader →*

# MDDLoader

A loader for the MDD format.

MDD stores a position for every vertex in a model for every frame in an animation. Similar to BVH, it can be used to transfer animation data between different 3D applications or engines.

MDD stores its data in binary format (big endian) in the following way:

*   number of frames (a single uint32)
*   number of vertices (a single uint32)
*   time values for each frame (sequence of float32)
*   vertex data for each frame (sequence of float32)

## Code Example

```js
const loader = new MDDLoader();
const result = await loader.loadAsync( 'models/mdd/cube.mdd' );
const morphTargets = result.morphTargets;
const clip = result.clip;
// clip.optimize(); // optional
const geometry = new THREE.BoxGeometry();
geometry.morphAttributes.position = morphTargets; // apply morph targets (vertex data must match)
const material = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );
const mixer = new THREE.AnimationMixer( mesh );
mixer.clipAction( clip ).play();
```

## Import

MDDLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { MDDLoader } from 'three/addons/loaders/MDDLoader.js';
```

## Constructor

### new MDDLoader( manager : LoadingManager )

Constructs a new MDD loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded MDD asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : Object

Parses the given MDD data and returns an object holding the animation clip and the respective morph targets.

**data**

The raw XYZ data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The result object.

## Source

[examples/jsm/loaders/MDDLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/MDDLoader.js)