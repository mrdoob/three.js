*Inheritance: Loader →*

# TTFLoader

A loader for the TTF format.

Loads TTF files and converts them into typeface JSON that can be used directly to create THREE.Font objects.

## Code Example

```js
const loader = new TTFLoader();
const json = await loader.loadAsync( 'fonts/ttf/kenpixel.ttf' );
const font = new Font( json );
```

## Import

TTFLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { TTFLoader } from 'three/addons/loaders/TTFLoader.js';
```

## Constructor

### new TTFLoader( manager : LoadingManager )

Constructs a new TTF loader.

**manager**

The loading manager.

## Properties

### .reversed : boolean

Whether the TTF commands should be reversed or not.

Default is `false`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded TTF asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( arraybuffer : ArrayBuffer ) : Object

Parses the given TTF data and returns a JSON for creating a font.

**arraybuffer**

The raw TTF data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The result JSON.

## Source

[examples/jsm/loaders/TTFLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/TTFLoader.js)