# USDZExporter

An exporter for USDZ.

## Code Example

```js
const exporter = new USDZExporter();
const arraybuffer = await exporter.parseAsync( scene );
```

## Import

USDZExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
```

## Constructor

### new USDZExporter()

Constructs a new USDZ exporter.

## Properties

### .textureUtils : WebGLTextureUtils | WebGPUTextureUtils

A reference to a texture utils module.

Default is `null`.

## Methods

### .parse( scene : Object3D, onDone : USDZExporter~OnDone, onError : USDZExporter~OnError, options : USDZExporter~Options )

Parse the given 3D object and generates the USDZ output.

**scene**

The 3D object to export.

**onDone**

A callback function that is executed when the export has finished.

**onError**

A callback function that is executed when an error happens.

**options**

The export options.

### .parseAsync( scene : Object3D, options : USDZExporter~Options ) : Promise.<ArrayBuffer> (async)

Async version of [USDZExporter#parse](USDZExporter.html#parse).

**scene**

The 3D object to export.

**options**

The export options.

**Returns:** A Promise that resolved with the exported USDZ data.

### .setTextureUtils( utils : WebGLTextureUtils | WebGPUTextureUtils )

Sets the texture utils for this exporter. Only relevant when compressed textures have to be exported.

Depending on whether you use [WebGLRenderer](WebGLRenderer.html) or [WebGPURenderer](WebGPURenderer.html), you must inject the corresponding texture utils [WebGLTextureUtils](WebGLTextureUtils.html) or [WebGPUTextureUtils](WebGPUTextureUtils.html).

**utils**

The texture utils.

## Type Definitions

### .OnDone( result : ArrayBuffer )

onDone callback of `USDZExporter`.

**result**

The generated USDZ.

### .OnError( error : Error )

onError callback of `USDZExporter`.

**error**

The error object.

### .Options

Export options of `USDZExporter`.

**maxTextureSize**  
number

The maximum texture size that is going to be exported.

Default is `1024`.

**includeAnchoringProperties**  
boolean

Whether to include anchoring properties or not.

Default is `true`.

**onlyVisible**  
boolean

Export only visible 3D objects.

Default is `true`.

**ar**  
Object

If `includeAnchoringProperties` is set to `true`, the anchoring type and alignment can be configured via `ar.anchoring.type` and `ar.planeAnchoring.alignment`.

**quickLookCompatible**  
boolean

Whether to make the exported USDZ compatible to QuickLook which means the asset is modified to accommodate the bugs FB10036297 and FB11442287 (Apple Feedback).

Default is `false`.

## Source

[examples/jsm/exporters/USDZExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/USDZExporter.js)