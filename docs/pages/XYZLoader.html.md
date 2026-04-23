*Inheritance: Loader →*

# XYZLoader

A loader for the XYZ format.

XYZ is a very simple format for storing point clouds. The layouts `XYZ` (points) and `XYZRGB` (points + colors) are supported.

## Code Example

```js
const loader = new XYZLoader();
const geometry = await loader.loadAsync( 'models/xyz/helix_201.xyz' );
geometry.center();
const vertexColors = ( geometry.hasAttribute( 'color' ) === true );
const material = new THREE.PointsMaterial( { size: 0.1, vertexColors: vertexColors } );
const points = new THREE.Points( geometry, material );
scene.add( points );
```

## Import

XYZLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { XYZLoader } from 'three/addons/loaders/XYZLoader.js';
```

## Constructor

### new XYZLoader()

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded XYZ asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( text : string ) : BufferGeometry

Parses the given XYZ data and returns the resulting geometry.

**text**

The raw XYZ data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The geometry representing the point cloud.

## Source

[examples/jsm/loaders/XYZLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/XYZLoader.js)