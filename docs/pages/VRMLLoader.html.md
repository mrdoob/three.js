*Inheritance: Loader →*

# VRMLLoader

A loader for the VRML format.

## Code Example

```js
const loader = new VRMLLoader();
const object = await loader.loadAsync( 'models/vrml/house.wrl' );
scene.add( object );
```

## Import

VRMLLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { VRMLLoader } from 'three/addons/loaders/VRMLLoader.js';
```

## Constructor

### new VRMLLoader( manager : LoadingManager )

Constructs a new VRML loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded VRML asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : string, path : string ) : Scene

Parses the given VRML data and returns the resulting scene.

**data**

The raw VRML data as a string.

**path**

The URL base path.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed scene.

## Source

[examples/jsm/loaders/VRMLLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/VRMLLoader.js)