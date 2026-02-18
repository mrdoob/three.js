*Inheritance: Loader →*

# GCodeLoader

A loader for the GCode format.

GCode files are usually used for 3D printing or CNC applications.

## Code Example

```js
const loader = new GCodeLoader();
const object = await loader.loadAsync( 'models/gcode/benchy.gcode' );
scene.add( object );
```

## Import

GCodeLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GCodeLoader } from 'three/addons/loaders/GCodeLoader.js';
```

## Constructor

### new GCodeLoader( manager : LoadingManager )

Constructs a new GCode loader.

**manager**

The loading manager.

## Properties

### .splitLayer : boolean

Whether to split layers or not.

Default is `false`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded GCode asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : string ) : Group

Parses the given GCode data and returns a group with lines.

**data**

The raw Gcode data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed GCode asset.

## Source

[examples/jsm/loaders/GCodeLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/GCodeLoader.js)