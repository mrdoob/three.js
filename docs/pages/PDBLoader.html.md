*Inheritance: Loader →*

# PDBLoader

A loader for the PDB format.

The [Protein Data Bank](https://en.wikipedia.org/wiki/Protein_Data_Bank_\(file_format\)) file format is a textual file describing the three-dimensional structures of molecules.

## Code Example

```js
const loader = new PDBLoader();
const pdb = await loader.loadAsync( 'models/pdb/ethanol.pdb' );
const geometryAtoms = pdb.geometryAtoms;
const geometryBonds = pdb.geometryBonds;
const json = pdb.json;
```

## Import

PDBLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PDBLoader } from 'three/addons/loaders/PDBLoader.js';
```

## Constructor

### new PDBLoader( manager : LoadingManager )

Constructs a new PDB loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded PDB asset to the `onLoad()` callback.

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

Parses the given PDB data and returns an object holding the atoms and bond geometries as well as the raw atom data as JSON.

**text**

The raw PDB data as a string.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The result object.

## Source

[examples/jsm/loaders/PDBLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PDBLoader.js)