*Inheritance: Loader →*

# GLTFLoader

A loader for the glTF 2.0 format.

\[glTF\](https://www.khronos.org/gltf/} (GL Transmission Format) is an [open format specification](https://github.com/KhronosGroup/glTF/tree/main/specification/2.0\)) whenever possible. Be advised that image bitmaps are not automatically GC-collected when they are no longer referenced, and they require special handling during the disposal process.

`GLTFLoader` supports the following glTF 2.0 extensions:

*   KHR\_draco\_mesh\_compression
*   KHR\_materials\_clearcoat
*   KHR\_materials\_dispersion
*   KHR\_materials\_ior
*   KHR\_materials\_specular
*   KHR\_materials\_transmission
*   KHR\_materials\_iridescence
*   KHR\_materials\_unlit
*   KHR\_materials\_volume
*   KHR\_mesh\_quantization
*   KHR\_lights\_punctual
*   KHR\_texture\_basisu
*   KHR\_texture\_transform
*   EXT\_texture\_webp
*   EXT\_meshopt\_compression
*   EXT\_mesh\_gpu\_instancing

The following glTF 2.0 extension is supported by an external user plugin:

*   [KHR\_materials\_variants](https://github.com/takahirox/three-gltf-extensions)
*   [MSFT\_texture\_dds](https://github.com/takahirox/three-gltf-extensions)
*   [KHR\_animation\_pointer](https://github.com/needle-tools/three-animation-pointer)
*   [NEEDLE\_progressive](https://github.com/needle-tools/gltf-progressive)

## Code Example

```js
const loader = new GLTFLoader();
// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( '/examples/jsm/libs/draco/' );
loader.setDRACOLoader( dracoLoader );
const gltf = await loader.loadAsync( 'models/gltf/duck/duck.gltf' );
scene.add( gltf.scene );
```

## Import

GLTFLoader is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
```

## Constructor

### new GLTFLoader( manager : LoadingManager )

Constructs a new glTF loader.

**manager**

The loading manager.

## Methods

### .load( url : string, onLoad : function, onProgress : onProgressCallback, onError : onErrorCallback )

Starts loading from the given URL and passes the loaded glTF asset to the `onLoad()` callback.

**url**

The path/URL of the file to be loaded. This can also be a data URI.

**onLoad**

Executed when the loading process has been finished.

**onProgress**

Executed while the loading is in progress.

**onError**

Executed when errors occur.

**Overrides:** [Loader#load](Loader.html#load)

### .parse( data : string | ArrayBuffer, path : string, onLoad : function, onError : onErrorCallback )

Parses the given FBX data and returns the resulting group.

**data**

The raw glTF data.

**path**

The URL base path.

**onLoad**

Executed when the loading process has been finished.

**onError**

Executed when errors occur.

**Overrides:** [Loader#parse](Loader.html#parse)

### .parseAsync( data : string | ArrayBuffer, path : string ) : Promise.<GLTFLoader~LoadObject> (async)

Async version of [GLTFLoader#parse](GLTFLoader.html#parse).

**data**

The raw glTF data.

**path**

The URL base path.

**Returns:** A Promise that resolves with the loaded glTF when the parsing has been finished.

### .register( callback : function ) : GLTFLoader

Registers a plugin callback. This API is internally used to implement the various glTF extensions but can also used by third-party code to add additional logic to the loader.

**callback**

The callback function to register.

**Returns:** A reference to this loader.

### .setDRACOLoader( dracoLoader : DRACOLoader ) : GLTFLoader

Sets the given Draco loader to this loader. Required for decoding assets compressed with the `KHR_draco_mesh_compression` extension.

**dracoLoader**

The Draco loader to set.

**Returns:** A reference to this loader.

### .setKTX2Loader( ktx2Loader : KTX2Loader ) : GLTFLoader

Sets the given KTX2 loader to this loader. Required for loading KTX2 compressed textures.

**ktx2Loader**

The KTX2 loader to set.

**Returns:** A reference to this loader.

### .setMeshoptDecoder( meshoptDecoder : Object ) : GLTFLoader

Sets the given meshopt decoder. Required for decoding assets compressed with the `EXT_meshopt_compression` extension.

**meshoptDecoder**

The meshopt decoder to set.

**Returns:** A reference to this loader.

### .unregister( callback : function ) : GLTFLoader

Unregisters a plugin callback.

**callback**

The callback function to unregister.

**Returns:** A reference to this loader.

## Type Definitions

### .LoadObject

Loader result of `GLTFLoader`.

**animations**  
Array.<[AnimationClip](AnimationClip.html)\>

An array of animation clips.

**asset**  
Object

Meta data about the loaded asset.

**cameras**  
Array.<[Camera](Camera.html)\>

An array of cameras.

**parser**  
GLTFParser

A reference to the internal parser.

**scene**  
[Group](Group.html)

The default scene.

**scenes**  
Array.<[Group](Group.html)\>

glTF assets might define multiple scenes.

**userData**  
Object

Additional data.

## Source

[examples/jsm/loaders/GLTFLoader.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/loaders/GLTFLoader.js)