*Inheritance: Loader →*

# OBJLoader

A loader for the OBJ format.

The [OBJ format](https://en.wikipedia.org/wiki/Wavefront_.obj_file) is a simple data-format that represents 3D geometry in a human readable format as the position of each vertex, the UV position of each texture coordinate vertex, vertex normals, and the faces that make each polygon defined as a list of vertices, and texture vertices.

## Code Example

```js
const loader = new OBJLoader();
const object = await loader.loadAsync( 'models/monster.obj' );
scene.add( object );
```

## Import

OBJLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
```

## Constructor

### new OBJLoader( manager : LoadingManager )

Constructs a new OBJ loader.

**manager**

The loading manager.

## Properties

### .materials : MaterialCreator

A reference to a material creator.

Default is `null`.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded OBJ asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( text : string ) : Group

Parses the given OBJ data and returns the resulting group.

**text**

The raw OBJ data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed OBJ.

### .setMaterials( materials : MaterialCreator ) : OBJLoader

Sets the material creator for this OBJ. This object is loaded via [MTLLoader](MTLLoader.html).

**materials**

An object that creates the materials for this OBJ.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/OBJLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/OBJLoader.js)