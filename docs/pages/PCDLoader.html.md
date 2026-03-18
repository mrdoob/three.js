*Inheritance: Loader →*

# PCDLoader

A loader for the Point Cloud Data (PCD) format.

PCDLoader supports ASCII and (compressed) binary files as well as the following PCD fields:

*   x y z
*   rgb
*   normal\_x normal\_y normal\_z
*   intensity
*   label

## Code Example

```js
const loader = new PCDLoader();
const points = await loader.loadAsync( './models/pcd/binary/Zaghetto.pcd' );
points.geometry.center(); // optional
points.geometry.rotateX( Math.PI ); // optional
scene.add( points );
```

## Import

PCDLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js';
```

## Constructor

### new PCDLoader( manager : LoadingManager )

Constructs a new PCD loader.

**manager**

The loading manager.

## Properties

### .littleEndian : boolean

Whether to use little Endian or not.

Default is `true`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded PCD asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : Points

Parses the given PCD data and returns a point cloud.

**data**

The raw PCD data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed point cloud.

## Source

[examples/jsm/loaders/PCDLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PCDLoader.js)