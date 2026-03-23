*Inheritance: Loader →*

# PLYLoader

A loader for PLY the PLY format (known as the Polygon File Format or the Stanford Triangle Format).

Limitations:

*   ASCII decoding assumes file is UTF-8.

## Code Example

```js
const loader = new PLYLoader();
const geometry = await loader.loadAsync( './models/ply/ascii/dolphins.ply' );
scene.add( new THREE.Mesh( geometry ) );
```

## Import

PLYLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
```

## Constructor

### new PLYLoader( manager : LoadingManager )

Constructs a new PLY loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded PLY asset to the `onLoad()` callback.

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

Parses the given PLY data and returns the resulting geometry.

**data**

The raw PLY data as an array buffer.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed geometry.

### .setCustomPropertyNameMapping( mapping : Object )

Custom properties outside of the defaults for position, uv, normal and color attributes can be added using the setCustomPropertyNameMapping method. For example, the following maps the element properties “custom\_property\_a” and “custom\_property\_b” to an attribute “customAttribute” with an item size of 2. Attribute item sizes are set from the number of element properties in the property array.

```js
loader.setCustomPropertyNameMapping( {
	customAttribute: ['custom_property_a', 'custom_property_b'],
} );
```

**mapping**

The mapping dictionary.

### .setPropertyNameMapping( mapping : Object )

Sets a property name mapping that maps default property names to custom ones. For example, the following maps the properties “diffuse\_(red|green|blue)” in the file to standard color names.

```js
loader.setPropertyNameMapping( {
	diffuse_red: 'red',
	diffuse_green: 'green',
	diffuse_blue: 'blue'
} );
```

**mapping**

The mapping dictionary.

## Source

[examples/jsm/loaders/PLYLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/PLYLoader.js)