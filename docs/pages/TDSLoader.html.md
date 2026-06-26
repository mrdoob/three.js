*Inheritance: Loader →*

# TDSLoader

A loader for the 3DS format, based on lib3ds.

Loads geometry with uv and materials basic properties with texture support.

## Code Example

```js
const loader = new TDSLoader();
loader.setResourcePath( 'models/3ds/portalgun/textures/' );
const object = await loader.loadAsync( 'models/3ds/portalgun/portalgun.3ds' );
scene.add( object );
```

## Import

TDSLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TDSLoader } from 'three/addons/loaders/TDSLoader.js';
```

## Constructor

### new TDSLoader( manager : LoadingManager )

Constructs a new 3DS loader.

**manager**

The loading manager.

## Properties

### .debug : boolean

Whether debug mode should be enabled or not.

Default is `false`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded 3DS asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( arraybuffer : ArrayBuffer, path : string ) : Group

Parses the given 3DS data and returns the resulting data.

**arraybuffer**

The raw 3DS data as an array buffer.

**path**

The asset path.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed asset represented as a group.

## Source

[examples/jsm/loaders/TDSLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/TDSLoader.js)