# EXRExporter

An exporter for EXR.

EXR ( Extended Dynamic Range) is an [open format specification](https://github.com/AcademySoftwareFoundation/openexr) for professional-grade image storage format of the motion picture industry. The purpose of format is to accurately and efficiently represent high-dynamic-range scene-linear image data and associated metadata. The library is widely used in host application software where accuracy is critical, such as photorealistic rendering, texture access, image compositing, deep compositing, and DI.

## Code Example

```js
const exporter = new EXRExporter();
const result = await exporter.parse( renderer, options );
```

## Import

EXRExporter is an addon, and must be imported explicitly, see [Installation#Addons](https://threejs.org/manual/#en/installation).

```js
import { EXRExporter } from 'three/addons/exporters/EXRExporter.js';
```

## Constructor

### new EXRExporter()

## Methods

### .parse( arg1 : DataTexture | WebGPURenderer | WebGLRenderer, arg2 : EXRExporter~Options | RenderTarget, arg3 : EXRExporter~Options ) : Promise.<Uint8Array> (async)

This method has two variants.

*   When exporting a data texture, it receives two parameters. The texture and the exporter options.
*   When exporting a render target (e.g. a PMREM), it receives three parameters. The renderer, the render target and the exporter options.

**arg1**

The data texture to export or a renderer.

**arg2**

The exporter options or a render target.

**arg3**

The exporter options.

**Returns:** A Promise that resolves with the exported EXR.

## Type Definitions

### .Options

Export options of `EXRExporter`.

**type**  
[HalfFloatType](global.html#HalfFloatType) | [FloatType](global.html#FloatType)

Output data type.

Default is `HalfFloatType`.

**type**  
NO\_COMPRESSION | ZIP\_COMPRESSION | ZIPS\_COMPRESSION

The compression algorithm.

Default is `ZIP_COMPRESSION`.

## Source

[examples/jsm/exporters/EXRExporter.js](https://github.com/mrdoob/three.js/blob/master/examples/jsm/exporters/EXRExporter.js)