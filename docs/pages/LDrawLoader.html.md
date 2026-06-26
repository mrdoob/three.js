*Inheritance: Loader →*

# LDrawLoader

A loader for the LDraw format.

\[LDraw\](https://ldraw.org/} (LEGO Draw) is an [open format specification](https://ldraw.org/article/218.html) for describing LEGO and other construction set 3D models.

An LDraw asset (a text file usually with extension .ldr, .dat or .txt) can describe just a single construction piece, or an entire model. In the case of a model the LDraw file can reference other LDraw files, which are loaded from a library path set with `setPartsLibraryPath`. You usually download the LDraw official parts library, extract to a folder and point setPartsLibraryPath to it.

Library parts will be loaded by trial and error in subfolders 'parts', 'p' and 'models'. These file accesses are not optimal for web environment, so a script tool has been made to pack an LDraw file with all its dependencies into a single file, which loads much faster. See section 'Packing LDraw models'. The LDrawLoader example loads several packed files. The official parts library is not included due to its large size.

`LDrawLoader` supports the following extensions:

*   !COLOUR: Color and surface finish declarations.
*   BFC: Back Face Culling specification.
*   !CATEGORY: Model/part category declarations.
*   !KEYWORDS: Model/part keywords declarations.

## Code Example

```js
const loader = new LDrawLoader();
loader.setConditionalLineMaterial( LDrawConditionalLineMaterial ); // the type of line material depends on the used renderer
const object = await loader.loadAsync( 'models/ldraw/officialLibrary/models/car.ldr_Packed.mpd' );
scene.add( object );
```

## Import

LDrawLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { LDrawLoader } from 'three/addons/loaders/LDrawLoader.js';
```

## Constructor

### new LDrawLoader( manager : LoadingManager )

Constructs a new LDraw loader.

**manager**

The loading manager.

## Methods

### .addDefaultMaterials() : LDrawLoader

Initializes the loader with default materials.

**Returns:** A reference to this loader.

### .addMaterial( material : Material ) : LDrawLoader

Adds a single material to the loader's material library.

**material**

The material to add.

**Returns:** A reference to this loader.

### .addMaterials( materials : Array.<Material> ) : LDrawLoader

Adds a list of materials to the loader's material library.

**materials**

The materials to add.

**Returns:** A reference to this loader.

### .clearMaterials() : LDrawLoader

Clears the loader's material library.

**Returns:** A reference to this loader.

### .getMainEdgeMaterial() : Material

Returns the material for the edges main LDraw color.

**Returns:** The material. Returns `null` if no material has been found.

### .getMainMaterial() : Material

Returns the Material for the main LDraw color.

For an already loaded LDraw asset, returns the Material associated with the main color code. This method can be useful to modify the main material of a model or part that exposes it.

The main color code is the standard way to color an LDraw part. It is '16' for triangles and '24' for edges. Usually a complete model will not expose the main color (that is, no part uses the code '16' at the top level, because they are assigned other specific colors) An LDraw part file on the other hand will expose the code '16' to be colored, and can have additional fixed colors.

**Returns:** The material. Returns `null` if no material has been found.

### .getMaterial( colorCode : string ) : Material

Returns a material for the given color code.

**colorCode**

The color code.

**Returns:** The material. Returns `null` if no material has been found.

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded LDraw asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( text : string, onLoad : function, onError : onErrorCallback )

Parses the given LDraw data and returns the resulting group.

**text**

The raw VRML data as a string.

**onLoad**

Executed when the loading/parsing process has been finished.

**onError**

Executed when errors occur.

**Overrides:** [Loader#parse](Loader.html#parse)

### .preloadMaterials( url : string ) : Promise (async)

This async method preloads materials from a single LDraw file. In the official parts library there is a special file which is loaded always the first (LDConfig.ldr) and contains all the standard color codes. This method is intended to be used with not packed files, for example in an editor where materials are preloaded and parts are loaded on demand.

**url**

Path of the LDraw materials asset.

**Returns:** A Promise that resolves when the preload has finished.

### .setConditionalLineMaterial( type : LDrawConditionalLineMaterial.constructor | LDrawConditionalLineNodeMaterial.constructor ) : LDrawLoader

Sets the conditional line material type which depends on the used renderer. Use [LDrawConditionalLineMaterial](LDrawConditionalLineMaterial.html) when using `WebGLRenderer` and LDrawConditionalLineNodeMaterial when using `WebGPURenderer`.

**type**

The conditional line material type.

**Returns:** A reference to this loader.

### .setFileMap( fileMap : Object.<string, string> ) : LDrawLoader

Sets a map which maps referenced library filenames to new filenames. If a fileMap is not specified (the default), library parts will be accessed by trial and error in subfolders 'parts', 'p' and 'models'.

**fileMap**

The file map to set.

**Returns:** A reference to this loader.

### .setMaterials( materials : Array.<Material> ) : LDrawLoader

Sets the loader's material library. This method clears existing material definitions.

**materials**

The materials to set.

**Returns:** A reference to this loader.

### .setPartsLibraryPath( path : string ) : LDrawLoader

This method must be called prior to `load()` unless the model to load does not reference library parts (usually it will be a model with all its parts packed in a single file).

**path**

Path to library parts files to load referenced parts from. This is different from Loader.setPath, which indicates the path to load the main asset from.

**Returns:** A reference to this loader.

## Source

[examples/jsm/loaders/LDrawLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/LDrawLoader.js)