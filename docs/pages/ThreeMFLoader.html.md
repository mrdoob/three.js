*Inheritance: Loader →*

# ThreeMFLoader

A loader for the [3D Manufacturing Format (3MF)](https://3mf.io/specification/) format.

The following features from the core specification are supported:

*   3D Models
*   Object Resources (Meshes and Components)
*   Material Resources (Base Materials)

3MF Materials and Properties Extension are only partially supported.

*   Texture 2D
*   Texture 2D Groups
*   Color Groups (Vertex Colors)
*   Metallic Display Properties (PBR)

## Code Example

```js
const loader = new ThreeMFLoader();
const object = await loader.loadAsync( './models/3mf/truck.3mf' );
object.rotation.set( - Math.PI / 2, 0, 0 ); // z-up conversion
scene.add( object );
```

## Import

ThreeMFLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { ThreeMFLoader } from 'three/addons/loaders/3MFLoader.js';
```

## Constructor

### new ThreeMFLoader( manager : LoadingManager )

Constructs a new 3MF loader.

**manager**

The loading manager.

## Properties

### .availableExtensions : Array.<Object>

An array of available extensions.

## Methods

### .addExtension( extension : Object )

Adds a 3MF extension.

**extension**

The extension to add.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded 3MF asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : Group

Parses the given 3MF data and returns the resulting group.

**data**

The raw 3MF asset data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** A group representing the parsed asset.

## Source

[examples/jsm/loaders/3MFLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/3MFLoader.js)