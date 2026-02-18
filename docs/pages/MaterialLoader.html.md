*Inheritance: Loader →*

# MaterialLoader

Class for loading materials. The files are internally loaded via [FileLoader](FileLoader.html).

This loader does not support node materials. Use [NodeMaterialLoader](NodeMaterialLoader.html) instead.

## Code Example

```js
const loader = new THREE.MaterialLoader();
const material = await loader.loadAsync( 'material.json' );
```

## Constructor

### new MaterialLoader( manager : LoadingManager )

Constructs a new material loader.

**manager**

The loading manager.

## Properties

### .textures : Object.<string, Texture>

A dictionary holding textures used by the material.

## Methods

### .createMaterialFromType( type : string ) : Material

Creates a material for the given type.

**type**

The material type.

**Returns:** The new material.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and pass the loaded material to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( json : Object ) : Material

Parses the given JSON object and returns a material.

**json**

The serialized material.

**Overrides:** [Loader#parse](Loader.html#parse)

**Returns:** The parsed material.

### .setTextures( value : Object ) : MaterialLoader

Textures are not embedded in the material JSON so they have to be injected before the loading process starts.

**value**

A dictionary holding textures for material properties.

**Returns:** A reference to this material loader.

## Static Methods

### .createMaterialFromType( type : string ) : Material

Creates a material for the given type.

**type**

The material type.

**Returns:** The new material.

## Source

[src/loaders/MaterialLoader.js](https://github.com/mrdoob/three.js/blob/master/src/loaders/MaterialLoader.js)