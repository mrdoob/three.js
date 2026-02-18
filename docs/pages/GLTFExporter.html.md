# GLTFExporter

An exporter for `glTF` 2.0.

glTF (GL Transmission Format) is an [open format specification](https://github.com/KhronosGroup/glTF/tree/master/specification/2.0) for efficient delivery and loading of 3D content. Assets may be provided either in JSON (.gltf) or binary (.glb) format. External files store textures (.jpg, .png) and additional binary data (.bin). A glTF asset may deliver one or more scenes, including meshes, materials, textures, skins, skeletons, morph targets, animations, lights, and/or cameras.

GLTFExporter supports the [glTF 2.0 extensions](https://github.com/KhronosGroup/glTF/tree/master/extensions/):

*   KHR\_lights\_punctual
*   KHR\_materials\_clearcoat
*   KHR\_materials\_dispersion
*   KHR\_materials\_emissive\_strength
*   KHR\_materials\_ior
*   KHR\_materials\_iridescence
*   KHR\_materials\_specular
*   KHR\_materials\_sheen
*   KHR\_materials\_transmission
*   KHR\_materials\_unlit
*   KHR\_materials\_volume
*   KHR\_mesh\_quantization
*   KHR\_texture\_transform
*   EXT\_materials\_bump
*   EXT\_mesh\_gpu\_instancing

The following glTF 2.0 extension is supported by an external user plugin:

*   [KHR\_materials\_variants](https://github.com/takahirox/three-gltf-extensions)

## Code Example

```js
const exporter = new GLTFExporter();
const data = await exporter.parseAsync( scene, options );
```

## Import

GLTFExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
```

## Constructor

### new GLTFExporter()

Constructs a new glTF exporter.

## Properties

### .textureUtils : WebGLTextureUtils | WebGPUTextureUtils

A reference to a texture utils module.

Default is `null`.

## Methods

### .parse( input : Scene | Array.<Scene>, onDone : GLTFExporter~OnDone, onError : GLTFExporter~OnError, options : GLTFExporter~Options )

Parses the given scenes and generates the glTF output.

**input**

A scene or an array of scenes.

**onDone**

A callback function that is executed when the export has finished.

**onError**

A callback function that is executed when an error happens.

**options**

options

### .parseAsync( input : Scene | Array.<Scene>, options : GLTFExporter~Options ) : Promise.<(ArrayBuffer|string)>

Async version of [GLTFExporter#parse](GLTFExporter.html#parse).

**input**

A scene or an array of scenes.

**options**

options.

**Returns:** A Promise that resolved with the exported glTF data.

### .register( callback : function ) : GLTFExporter

Registers a plugin callback. This API is internally used to implement the various glTF extensions but can also used by third-party code to add additional logic to the exporter.

**callback**

The callback function to register.

**Returns:** A reference to this exporter.

### .setTextureUtils( utils : WebGLTextureUtils | WebGPUTextureUtils ) : GLTFExporter

Sets the texture utils for this exporter. Only relevant when compressed textures have to be exported.

Depending on whether you use [WebGLRenderer](WebGLRenderer.html) or [WebGPURenderer](WebGPURenderer.html), you must inject the corresponding texture utils [WebGLTextureUtils](WebGLTextureUtils.html) or [WebGPUTextureUtils](WebGPUTextureUtils.html).

**utils**

The texture utils.

**Returns:** A reference to this exporter.

### .unregister( callback : function ) : GLTFExporter

Unregisters a plugin callback.

**callback**

The callback function to unregister.

**Returns:** A reference to this exporter.

## Type Definitions

### .OnDone( result : ArrayBuffer | string )

onDone callback of `GLTFExporter`.

**result**

The generated .gltf (JSON) or .glb (binary).

### .OnError( error : Error )

onError callback of `GLTFExporter`.

**error**

The error object.

### .Options

Export options of `GLTFExporter`.

**trs**  
boolean

Export position, rotation and scale instead of matrix per node.

Default is `false`.

**onlyVisible**  
boolean

Export only visible 3D objects.

Default is `true`.

**binary**  
boolean

Export in binary (.glb) format, returning an ArrayBuffer.

Default is `false`.

**maxTextureSize**  
number

Restricts the image maximum size (both width and height) to the given value.

Default is `Infinity`.

**animations**  
Array.<[AnimationClip](AnimationClip.html)\>

List of animations to be included in the export.

Default is `[]`.

**includeCustomExtensions**  
boolean

Export custom glTF extensions defined on an object's `userData.gltfExtensions` property.

Default is `false`.

## Source

[examples/jsm/exporters/GLTFExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/GLTFExporter.js)