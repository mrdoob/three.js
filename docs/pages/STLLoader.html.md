*Inheritance: Loader →*

# STLLoader

A loader for the STL format, as created by Solidworks and other CAD programs.

Supports both binary and ASCII encoded files. The loader returns a non-indexed buffer geometry.

Limitations:

*   Binary decoding supports "Magics" color format (http://en.wikipedia.org/wiki/STL\_(file\_format)#Color\_in\_binary\_STL).
*   There is perhaps some question as to how valid it is to always assume little-endian-ness.
*   ASCII decoding assumes file is UTF-8.

For binary STLs geometry might contain colors for vertices. To use it:

```js
// use the same code to load STL as above
if ( geometry.hasColors ) {
	material = new THREE.MeshPhongMaterial( { opacity: geometry.alpha, vertexColors: true } );
}
const mesh = new THREE.Mesh( geometry, material );
```

For ASCII STLs containing multiple solids, each solid is assigned to a different group. Groups can be used to assign a different color by defining an array of materials with the same length of geometry.groups and passing it to the Mesh constructor:

```js
const materials = [];
const nGeometryGroups = geometry.groups.length;
for ( let i = 0; i < nGeometryGroups; i ++ ) {
	const material = new THREE.MeshPhongMaterial( { color: colorMap[ i ], wireframe: false } );
	materials.push( material );
}
const mesh = new THREE.Mesh(geometry, materials);
```

## Code Example

```js
const loader = new STLLoader();
const geometry = await loader.loadAsync( './models/stl/slotted_disk.stl' )
scene.add( new THREE.Mesh( geometry ) );
```

## Import

STLLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
```

## Constructor

### new STLLoader( manager : LoadingManager )

Constructs a new STL loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded STL asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : ArrayBuffer ) : BufferGeometry

Parses the given STL data and returns the resulting geometry.

**data**

The raw STL data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed geometry.

## Source

[examples/jsm/loaders/STLLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/STLLoader.js)